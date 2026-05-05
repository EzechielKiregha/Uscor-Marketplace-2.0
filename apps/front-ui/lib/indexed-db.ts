import { type IDBPDatabase, openDB } from "idb";

interface OfflineOperation {
	id: string;
	type: string;
	saleId?: string;
	productId?: string;
	saleProductId?: string;
	quantity?: number;
	paymentMethod?: string;
	modifiers?: any;
	timestamp: string;
	status: "PENDING" | "SYNCED" | "FAILED";
	error?: string;
}

interface WorkerCacheItem {
	key: string;
	data: any;
	timestamp: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const DB_NAME = "uscor-worker-db";
const DB_VERSION = 1;

const STORES = {
	OFFLINE_OPERATIONS: "offlineOperations",
	WORKER_CACHE: "workerCache",
	LOCAL_SALES: "localSales",
	LOCAL_INVENTORY: "localInventory",
	LOCAL_CHAT: "localChat",
};

export async function initDB() {
	if (dbPromise) return dbPromise;

	dbPromise = openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Offline operations store
			if (!db.objectStoreNames.contains(STORES.OFFLINE_OPERATIONS)) {
				const offlineStore = db.createObjectStore(STORES.OFFLINE_OPERATIONS, {
					keyPath: "id",
				});
				offlineStore.createIndex("timestamp", "timestamp", { unique: false });
				offlineStore.createIndex("status", "status", { unique: false });
				offlineStore.createIndex("operationName", "operationName", {
					unique: false,
				});
			}

			// Worker cache store
			if (!db.objectStoreNames.contains(STORES.WORKER_CACHE)) {
				const cacheStore = db.createObjectStore(STORES.WORKER_CACHE, {
					keyPath: "key",
				});
				cacheStore.createIndex("timestamp", "timestamp", { unique: false });
			}

			// Local sales store
			if (!db.objectStoreNames.contains(STORES.LOCAL_SALES)) {
				const salesStore = db.createObjectStore(STORES.LOCAL_SALES, {
					keyPath: "id",
				});
				salesStore.createIndex("storeId", "storeId", { unique: false });
				salesStore.createIndex("status", "status", { unique: false });
				salesStore.createIndex("createdAt", "createdAt", { unique: false });
			}

			// Local inventory store
			if (!db.objectStoreNames.contains(STORES.LOCAL_INVENTORY)) {
				const inventoryStore = db.createObjectStore(STORES.LOCAL_INVENTORY, {
					keyPath: "id",
				});
				inventoryStore.createIndex("storeId", "storeId", { unique: false });
				inventoryStore.createIndex("productId", "productId", { unique: false });
				inventoryStore.createIndex("quantity", "quantity", { unique: false });
			}

			// Local chat store
			if (!db.objectStoreNames.contains(STORES.LOCAL_CHAT)) {
				const chatStore = db.createObjectStore(STORES.LOCAL_CHAT, {
					keyPath: "id",
				});
				chatStore.createIndex("chatId", "chatId", { unique: false });
				chatStore.createIndex("createdAt", "createdAt", { unique: false });
			}
		},
	});

	return dbPromise;
}

export async function saveToIndexedDB(storeName: string, data: any) {
	const db = await initDB();
	return db.put(storeName, data);
}

export async function getFromIndexedDB(storeName: string, key: string) {
	const db = await initDB();
	return db.get(storeName, key);
}

export async function getAllFromIndexedDB(storeName: string) {
	const db = await initDB();
	return db.getAll(storeName);
}

export async function updateIndexedDB(
	storeName: string,
	key: string,
	data: any,
) {
	const db = await initDB();
	const existing = await db.get(storeName, key);
	if (existing) {
		return db.put(storeName, { ...existing, ...data });
	}
	return db.put(storeName, data);
}

export async function removeFromIndexedDB(storeName: string, key: string) {
	const db = await initDB();
	return db.delete(storeName, key);
}

export async function clearIndexedDB(storeName: string) {
	const db = await initDB();
	return db.clear(storeName);
}

// Sync offline operations when online
export async function syncOfflineOperations(
	addSaleProduct?: any,
	updateSaleProduct?: any,
	removeSaleProduct?: any,
	completeSale?: any
) {
	const db = await initDB();
	const offlineOps = await db.getAll(
		STORES.OFFLINE_OPERATIONS,
		IDBKeyRange.only("PENDING"),
	);

	for (const op of offlineOps) {
		try {
			console.log("Syncing offline operation:", op);

			switch (op.type) {
				case "ADD_PRODUCT":
					if (addSaleProduct && op.saleId && op.productId && op.quantity) {
						await addSaleProduct({
							variables: {
								input: {
									saleId: op.saleId,
									productId: op.productId,
									quantity: op.quantity,
									modifiers: null,
								},
							},
						});
					}
					break;

				case "REMOVE_PRODUCT":
					if (removeSaleProduct && op.saleProductId) {
						await removeSaleProduct({
							variables: { id: op.saleProductId },
						});
					}
					break;

				case "COMPLETE_SALE":
					if (completeSale && op.saleId && op.paymentMethod) {
						await completeSale({
							variables: {
								id: op.saleId,
								paymentMethod: op.paymentMethod,
								paymentDetails: undefined,
							},
						});
					}
					break;

				default:
					console.warn("Unknown operation type:", op.type);
					break;
			}

			// Update status to synced
			await updateIndexedDB(STORES.OFFLINE_OPERATIONS, op.id, {
				status: "SYNCED",
			});
		} catch (error: any) {
			console.error("Failed to sync operation:", op.id, error);
			await updateIndexedDB(STORES.OFFLINE_OPERATIONS, op.id, {
				status: "FAILED",
				error: error.message,
			});
		}
	}
}

// Listen for online/offline events
export function setupOfflineSync() {
	window.addEventListener("online", () => {
		// Note: This function is deprecated. Sync is now handled by the useIndexedDB hook
		// which requires access to GraphQL mutations
		console.warn("setupOfflineSync is deprecated. Use useIndexedDB hook instead.");
	});

	// Initial sync if online
	if (navigator.onLine) {
		console.warn("setupOfflineSync initial sync skipped. Use useIndexedDB hook instead.");
	}
}
