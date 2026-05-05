import { useEffect, useState } from "react";
import {
	clearIndexedDB,
	getAllFromIndexedDB,
	getFromIndexedDB,
	initDB,
	removeFromIndexedDB,
	saveToIndexedDB,
	syncOfflineOperations,
	updateIndexedDB,
} from "@/lib/indexed-db";

export const useIndexedDB = () => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [syncing, setSyncing] = useState(false);

	// Initialize IndexedDB
	useEffect(() => {
		const initializeDB = async () => {
			try {
				await initDB();
				setIsInitialized(true);
			} catch (error) {
				console.error("Failed to initialize IndexedDB:", error);
			}
		};

		initializeDB();

		// Set up online/offline listeners
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	

	// Auto-sync when coming online
	useEffect(() => {
		if (isOnline && isInitialized) {
			handleSync();
		}
	}, [isOnline, isInitialized]);

	const saveData = async (storeName: string, data: any) => {
		if (!isInitialized) return;
		try {
			return await saveToIndexedDB(storeName, data);
		} catch (error) {
			console.error("Failed to save to IndexedDB:", error);
			return null;
		}
	};

	const handleSync = async (
		mutations?: {
			addSaleProduct?: any;
			updateSaleProduct?: any;
			removeSaleProduct?: any;
			completeSale?: any;
		}
	) => {
		if (!isOnline || !isInitialized) return;

		setSyncing(true);
		try {
			await syncOfflineOperations(
				mutations?.addSaleProduct,
				mutations?.updateSaleProduct,
				mutations?.removeSaleProduct,
				mutations?.completeSale
			);
		} catch (error) {
			console.error("Sync failed:", error);
		} finally {
			setSyncing(false);
		}
	};

	const getData = async (storeName: string, key: string) => {
		if (!isInitialized) return null;
		try {
			return await getFromIndexedDB(storeName, key);
		} catch (error) {
			console.error("Failed to get from IndexedDB:", error);
			return null;
		}
	};

	const getAllData = async (storeName: string) => {
		if (!isInitialized) return [];
		try {
			return await getAllFromIndexedDB(storeName);
		} catch (error) {
			console.error("Failed to get all from IndexedDB:", error);
			return [];
		}
	};

	const updateData = async (storeName: string, key: string, data: any) => {
		if (!isInitialized) return;
		try {
			return await updateIndexedDB(storeName, key, data);
		} catch (error) {
			console.error("Failed to update IndexedDB:", error);
			return null;
		}
	};

	const removeData = async (storeName: string, key: string) => {
		if (!isInitialized) return;
		try {
			return await removeFromIndexedDB(storeName, key);
		} catch (error) {
			console.error("Failed to remove from IndexedDB:", error);
			return null;
		}
	};

	const clearStore = async (storeName: string) => {
		if (!isInitialized) return;
		try {
			return await clearIndexedDB(storeName);
		} catch (error) {
			console.error("Failed to clear IndexedDB store:", error);
			return null;
		}
	};

	// Specialized methods for worker-specific data
	const saveLocalSale = async (sale: any) => {
		return saveData("localSales", {
			...sale,
			status: "PENDING_SYNC",
			createdAt: sale.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
	};

	const getLocalSales = async () => {
		return getAllData("localSales");
	};

	const saveLocalInventory = async (inventory: any) => {
		return saveData("localInventory", {
			...inventory,
			lastUpdated: new Date().toISOString(),
		});
	};

	const getLocalInventory = async () => {
		return getAllData("localInventory");
	};

	const saveOfflineOperation = async (operation: any) => {
		return saveData("offlineOperations", {
			...operation,
			status: "PENDING",
			timestamp: new Date().toISOString(),
		});
	};

	const getPendingOperations = async () => {
		const allOps = await getAllData("offlineOperations");
		return allOps.filter((op: any) => op.status === "PENDING");
	};

	return {
		isInitialized,
		isOnline,
		syncing,
		saveData,
		getData,
		getAllData,
		updateData,
		removeData,
		clearStore,
		handleSync,
		saveLocalSale,
		getLocalSales,
		saveLocalInventory,
		getLocalInventory,
		saveOfflineOperation,
		getPendingOperations,
	};
};
