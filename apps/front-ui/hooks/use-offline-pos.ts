"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { useToast } from "@/components/toast-provider";
import {
	ADD_SALE_PRODUCT,
	COMPLETE_SALE,
	CREATE_SALE,
	GET_ACTIVE_SALES,
	GET_SALES_HISTORY,
	ON_SALE_CREATED,
	ON_SALE_UPDATED,
	SYNC_OFFLINE_SALES,
} from "@/graphql/sales.gql";
import {
	getAllFromIndexedDB,
	getFromIndexedDB,
	initDB,
	removeFromIndexedDB,
	saveToIndexedDB,
	updateIndexedDB,
} from "@/lib/indexed-db";
import { getDeviceId } from "@/lib/device-id";
import {
	cacheProductCatalog,
	getCachedProducts,
	getCachedProductById,
	type CachedProduct,
} from "@/lib/catalog-cache";

// ─── Types ─────────────────────────────────────────────

export interface OfflineOperation {
	id: string;
	type: string;
	payload: any;
	timestamp: string;
	deviceId: string;
	status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED" | "CONFLICT";
	retryCount: number;
	error?: string;
}

export interface LocalSale {
	id: string;
	localId: string;
	storeId: string;
	workerId: string;
	clientId?: string;
	totalAmount: number;
	discount: number;
	paymentMethod: string;
	status: string;
	syncStatus: string;
	localTimestamp: string;
	deviceId: string;
	saleProducts: Array<{
		id: string;
		productId: string;
		quantity: number;
		price: number;
		modifiers?: any;
		product?: CachedProduct;
	}>;
	createdAt: string;
}

export interface SyncConflict {
	id: string;
	localId: string;
	details: string;
	createdAt: string;
	resolved: boolean;
}

// ─── Hook ──────────────────────────────────────────────

export function useOfflinePOS(
	storeId: string,
	workerId: string,
	role: string,
) {
	const [isOnline, setIsOnline] = useState(
		typeof navigator !== "undefined" ? navigator.onLine : true,
	);
	const [pendingCount, setPendingCount] = useState(0);
	const [syncStatus, setSyncStatus] = useState<
		"idle" | "syncing" | "error"
	>("idle");
	const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
	const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
	const [localSales, setLocalSales] = useState<LocalSale[]>([]);
	const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
	const syncingRef = useRef(false);

	const { showToast } = useToast();

	// ─── GraphQL ────────────────────────────────────

	const {
		data: activeSalesData,
		loading: activeSalesLoading,
		refetch: refetchActiveSales,
	} = useQuery(GET_ACTIVE_SALES, {
		variables: { storeId },
		skip: !storeId || !isOnline,
	});

	const {
		data: salesHistoryData,
		loading: salesHistoryLoading,
		refetch: refetchSalesHistory,
	} = useQuery(GET_SALES_HISTORY, {
		variables: {
			storeId,
			status: "COMPLETED",
			workerId: role === "worker" ? workerId : "",
		},
		skip: !storeId || !isOnline,
	});

	const [createSaleMutation] = useMutation(CREATE_SALE);
	const [addSaleProductMutation] = useMutation(ADD_SALE_PRODUCT);
	const [completeSaleMutation] = useMutation(COMPLETE_SALE);
	const [syncOfflineSalesMutation] = useMutation(SYNC_OFFLINE_SALES);

	// Real-time updates
	useSubscription(ON_SALE_CREATED, {
		variables: { storeId },
		skip: !storeId || !isOnline,
		onData: () => {
			refetchActiveSales();
			refetchSalesHistory();
		},
	});

	useSubscription(ON_SALE_UPDATED, {
		variables: { storeId },
		skip: !storeId || !isOnline,
		onData: () => {
			refetchActiveSales();
			refetchSalesHistory();
		},
	});

	// ─── Init & Listeners ───────────────────────────

	useEffect(() => {
		initDB();
		updatePendingCount();
		loadLocalSales();
		loadConflicts();

		const handleOnline = () => {
			setIsOnline(true);
			syncPendingOperations();
		};
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Listen for service worker sync messages
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.addEventListener("message", (event) => {
				if (event.data?.type === "TRIGGER_SYNC") {
					syncPendingOperations();
				}
			});
		}

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	// Cache product catalog when online and storeId changes
	useEffect(() => {
		if (isOnline && storeId) {
			cacheProductCatalog(storeId).then((count) => {
				if (count > 0) {
					console.log(
						`[OfflinePOS] Cached ${count} products for store ${storeId}`,
					);
				}
			});
		}
	}, [storeId, isOnline]);

	// Periodic sync every 30s when online
	useEffect(() => {
		if (!isOnline) return;
		const interval = setInterval(() => {
			if (navigator.onLine) syncPendingOperations();
		}, 30000);
		return () => clearInterval(interval);
	}, [isOnline]);

	// ─── Internal Helpers ───────────────────────────

	async function updatePendingCount() {
		try {
			const allOps = await getAllFromIndexedDB("offlineOperations");
			const pending = allOps.filter(
				(op: OfflineOperation) => op.status === "PENDING",
			);
			setPendingCount(pending.length);
		} catch {
			setPendingCount(0);
		}
	}

	async function loadLocalSales() {
		try {
			const sales = await getAllFromIndexedDB("localSales");
			setLocalSales(
				sales.filter(
					(s: LocalSale) => s.storeId === storeId,
				),
			);
		} catch {
			setLocalSales([]);
		}
	}

	async function loadConflicts() {
		try {
			const allConflicts = await getAllFromIndexedDB("conflictLog");
			setConflicts(
				allConflicts.filter((c: SyncConflict) => !c.resolved),
			);
		} catch {
			setConflicts([]);
		}
	}

	// ─── Core POS Operations ────────────────────────

	const createSale = useCallback(
		async (saleWorkerId?: string, clientId?: string) => {
			const effectiveWorkerId = saleWorkerId || workerId;

			if (isOnline) {
				try {
					const { data } = await createSaleMutation({
						variables: {
							input: {
								storeId,
								workerId: effectiveWorkerId,
								clientId: clientId || undefined,
								totalAmount: 0,
								discount: 0,
								paymentMethod: "CASH",
								saleProducts: [],
							},
						},
					});
					const newSaleId = data.createSale.id;
					setCurrentSaleId(newSaleId);
					showToast("success", "New Sale", "Sale created successfully");
					return newSaleId;
				} catch (error: any) {
					// If online mutation fails (e.g., network dropped mid-request), fall through to offline
					if (!navigator.onLine) {
						setIsOnline(false);
					} else {
						showToast("error", "Error", error.message || "Failed to create sale");
						throw error;
					}
				}
			}

			// Offline path
			const localId = crypto.randomUUID();
			const localSale: LocalSale = {
				id: localId,
				localId,
				storeId,
				workerId: effectiveWorkerId,
				clientId: clientId || undefined,
				totalAmount: 0,
				discount: 0,
				paymentMethod: "CASH",
				status: "OPEN",
				syncStatus: "PENDING_SYNC",
				localTimestamp: new Date().toISOString(),
				deviceId: getDeviceId(),
				saleProducts: [],
				createdAt: new Date().toISOString(),
			};

			await saveToIndexedDB("localSales", localSale);
			setCurrentSaleId(localId);
			await loadLocalSales();
			showToast("success", "Offline Sale", "Sale created locally — will sync when online");
			return localId;
		},
		[storeId, workerId, isOnline, createSaleMutation, showToast],
	);

	const addProductToSale = useCallback(
		async (
			saleId: string,
			productId: string,
			quantity: number = 1,
			modifiers?: any,
		) => {
			// Check if this is a local sale
			const localSale = await getFromIndexedDB("localSales", saleId);

			if (localSale) {
				// Offline: update local sale
				const product = await getCachedProductById(productId);
				if (!product) {
					showToast("error", "Error", "Product not found in cache");
					return false;
				}

				const saleProductId = crypto.randomUUID();
				localSale.saleProducts.push({
					id: saleProductId,
					productId,
					quantity,
					price: product.price,
					modifiers,
					product,
				});
				localSale.totalAmount += product.price * quantity;
				await saveToIndexedDB("localSales", localSale);
				await loadLocalSales();
				showToast("success", "Product Added", `${product.title} added to sale`);
				return true;
			}

			if (isOnline) {
				try {
					await addSaleProductMutation({
						variables: {
							input: { saleId, productId, quantity, modifiers },
						},
					});
					showToast("success", "Product Added", "Item added to sale");
					return true;
				} catch (error: any) {
					showToast("error", "Error", error.message || "Failed to add product");
					return false;
				}
			}

			showToast("error", "Error", "Cannot add product — sale not found");
			return false;
		},
		[isOnline, addSaleProductMutation, showToast],
	);

	const removeProductFromSale = useCallback(
		async (saleId: string, saleProductId: string) => {
			const localSale = await getFromIndexedDB("localSales", saleId);

			if (localSale) {
				const removed = localSale.saleProducts.find(
					(sp: any) => sp.id === saleProductId,
				);
				if (removed) {
					localSale.saleProducts = localSale.saleProducts.filter(
						(sp: any) => sp.id !== saleProductId,
					);
					localSale.totalAmount -= removed.price * removed.quantity;
					await saveToIndexedDB("localSales", localSale);
					await loadLocalSales();
				}
				return true;
			}

			// Online removal handled by parent component's existing mutation
			return false;
		},
		[],
	);

	const completeSale = useCallback(
		async (saleId: string, paymentMethod: string) => {
			const localSale = await getFromIndexedDB("localSales", saleId);

			if (localSale) {
				// Complete locally and queue for sync
				localSale.status = "COMPLETED";
				localSale.paymentMethod = paymentMethod;
				await saveToIndexedDB("localSales", localSale);

				// Queue the completed sale as a sync operation
				await saveToIndexedDB("offlineOperations", {
					id: crypto.randomUUID(),
					type: "SYNC_COMPLETED_SALE",
					payload: localSale,
					timestamp: new Date().toISOString(),
					deviceId: getDeviceId(),
					status: "PENDING",
					retryCount: 0,
				} as OfflineOperation);

				await updatePendingCount();
				await loadLocalSales();
				showToast(
					"success",
					"Sale Completed",
					"Saved locally — will sync when online",
				);

				// Try to sync immediately if online
				if (navigator.onLine) {
					syncPendingOperations();
				}

				setCurrentSaleId(null);
				return true;
			}

			if (isOnline) {
				try {
					await completeSaleMutation({
						variables: { id: saleId, paymentMethod },
					});
					setCurrentSaleId(null);
					showToast(
						"success",
						"Sale Completed",
						"Payment processed successfully",
					);
					return true;
				} catch (error: any) {
					showToast("error", "Error", error.message || "Failed to complete sale");
					return false;
				}
			}

			return false;
		},
		[isOnline, completeSaleMutation, showToast],
	);

	// ─── Sync Engine ────────────────────────────────

	const syncPendingOperations = useCallback(async () => {
		if (!navigator.onLine || syncingRef.current) return;
		syncingRef.current = true;
		setSyncStatus("syncing");

		try {
			const allOps = await getAllFromIndexedDB("offlineOperations");
			const pending = allOps.filter(
				(op: OfflineOperation) => op.status === "PENDING",
			);

			if (pending.length === 0) {
				setSyncStatus("idle");
				syncingRef.current = false;
				return;
			}

			// Collect completed sales for batch sync
			const completedSales = pending.filter(
				(op: OfflineOperation) => op.type === "SYNC_COMPLETED_SALE",
			);

			if (completedSales.length > 0) {
				const salesToSync = completedSales.map(
					(op: OfflineOperation) => ({
						localId: op.payload.localId,
						storeId: op.payload.storeId,
						workerId: op.payload.workerId,
						clientId: op.payload.clientId || undefined,
						totalAmount: op.payload.totalAmount,
						discount: op.payload.discount,
						paymentMethod: op.payload.paymentMethod,
						localTimestamp: op.payload.localTimestamp,
						deviceId: op.payload.deviceId,
						saleProducts: op.payload.saleProducts.map(
							(sp: any) => ({
								productId: sp.productId,
								quantity: sp.quantity,
								price: sp.price,
								modifiers: sp.modifiers || undefined,
							}),
						),
					}),
				);

				try {
					const { data } = await syncOfflineSalesMutation({
						variables: {
							input: { sales: salesToSync },
						},
					});

					const result = data.syncOfflineSales;

					// Process results
					for (const item of result.results) {
						const matchingOp = completedSales.find(
							(op: OfflineOperation) =>
								op.payload.localId === item.localId,
						);

						if (!matchingOp) continue;

						if (
							item.status === "SYNCED" ||
							item.status === "DUPLICATE"
						) {
							await updateIndexedDB(
								"offlineOperations",
								matchingOp.id,
								{ status: "SYNCED" },
							);
							await removeFromIndexedDB(
								"localSales",
								item.localId,
							);
						} else if (item.status === "CONFLICT") {
							await updateIndexedDB(
								"offlineOperations",
								matchingOp.id,
								{ status: "CONFLICT" },
							);
							await saveToIndexedDB("conflictLog", {
								id: crypto.randomUUID(),
								localId: item.localId,
								details: item.conflictDetails || "Inventory conflict",
								createdAt: new Date().toISOString(),
								resolved: false,
							});
						} else {
							await updateIndexedDB(
								"offlineOperations",
								matchingOp.id,
								{
									status: "FAILED",
									error: item.error,
									retryCount: matchingOp.retryCount + 1,
								},
							);
						}
					}

					if (result.synced > 0) {
						showToast(
							"success",
							"Synced",
							`${result.synced} offline sale${result.synced > 1 ? "s" : ""} synced successfully`,
						);
					}
					if (result.conflicts > 0) {
						showToast(
							"warning",
							"Conflicts",
							`${result.conflicts} sale${result.conflicts > 1 ? "s" : ""} have inventory conflicts`,
						);
					}

					// Refresh server data
					refetchActiveSales();
					refetchSalesHistory();
				} catch (error: any) {
					console.error("[OfflinePOS] Batch sync failed:", error);
					setSyncStatus("error");
				}
			}

			setLastSyncTime(new Date());
			await updatePendingCount();
			await loadLocalSales();
			await loadConflicts();
			setSyncStatus("idle");
		} catch (error) {
			console.error("[OfflinePOS] Sync error:", error);
			setSyncStatus("error");
		} finally {
			syncingRef.current = false;
		}
	}, [
		syncOfflineSalesMutation,
		refetchActiveSales,
		refetchSalesHistory,
		showToast,
	]);

	// ─── Getters ────────────────────────────────────

	const getCurrentSale = useCallback(() => {
		// Check local sales first (offline)
		const localActive = localSales.find(
			(s) => s.status === "OPEN" && s.storeId === storeId,
		);
		if (localActive) return localActive;

		// Then check server sales
		if (activeSalesData?.activeSales?.length) {
			return activeSalesData.activeSales[0];
		}
		return null;
	}, [localSales, activeSalesData, storeId]);

	const getSalesHistory = useCallback(() => {
		return salesHistoryData?.salesHistory?.items || [];
	}, [salesHistoryData]);

	const getCachedProductsForStore = useCallback(async () => {
		return getCachedProducts(storeId);
	}, [storeId]);

	const resolveConflict = useCallback(
		async (conflictId: string) => {
			await updateIndexedDB("conflictLog", conflictId, {
				resolved: true,
			});
			await loadConflicts();
		},
		[],
	);

	// ─── Return ─────────────────────────────────────

	return {
		// State
		isOnline,
		pendingCount,
		syncStatus,
		lastSyncTime,
		conflicts,
		localSales,
		currentSaleId,
		setCurrentSaleId,
		activeSalesLoading,
		salesHistoryLoading,

		// POS Operations
		createSale,
		addProductToSale,
		removeProductFromSale,
		completeSale,

		// Data Getters
		getCurrentSale,
		getSalesHistory,
		getCachedProductsForStore,

		// Sync
		syncPendingOperations,
		resolveConflict,

		// Refetch
		refetchActiveSales,
		refetchSalesHistory,
	};
}
