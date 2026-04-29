import { type IDBPDatabase, openDB } from "idb";

interface OfflineOperation {
	id: string;
	operationName: string;
	variables: any;
	timestamp: string;
	status: "PENDING" | "SYNCED" | "FAILED";
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
export async function syncOfflineOperations() {
	const db = await initDB();
	const offlineOps = await db.getAll(
		STORES.OFFLINE_OPERATIONS,
		IDBKeyRange.only("PENDING"),
	);

	for (const op of offlineOps) {
		try {
			// In a real implementation, you'd send this to your GraphQL endpoint
			// This is a simplified example
			console.log("Syncing offline operation:", op);

			// Update status to synced
			await updateIndexedDB(STORES.OFFLINE_OPERATIONS, op.id, {
				status: "SYNCED",
			});
		} catch (error) {
			console.error("Failed to sync operation:", op.id, error);
			await updateIndexedDB(STORES.OFFLINE_OPERATIONS, op.id, {
				status: "FAILED",
			});
		}
	}
}

// Listen for online/offline events
export function setupOfflineSync() {
	window.addEventListener("online", syncOfflineOperations);

	// Initial sync if online
	if (navigator.onLine) {
		syncOfflineOperations();
	}
}
