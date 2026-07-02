import { client } from "@/lib/apollo-client";
import {
    getAllFromIndexedDB,
    initDB,
    saveToIndexedDB
} from "@/lib/indexed-db";
import { gql } from "@apollo/client";

const GET_STORE_PRODUCTS_FOR_CACHE = gql`
	query GetStoreProductsForCache($storeId: String!) {
		storeProducts(storeId: $storeId) {
			id
			title
			description
			price
			quantity
			minQuantity
			sku
			barcode
			brand
			serialNumber
			warrantyMonths
			variants
			category {
				id
				name
			}
			medias {
				url
				type
			}
		}
	}
`;

export interface CachedProduct {
	id: string;
	storeId: string;
	title: string;
	description?: string;
	price: number;
	quantity: number;
	minQuantity: number;
	sku?: string;
	barcode?: string;
	brand?: string;
	serialNumber?: string;
	warrantyMonths?: number;
	variants?: any;
	categoryId: string;
	categoryName?: string;
	medias: Array<{ url: string; type: string }>;
	cachedAt: string;
}

/**
 * Cache the full product catalog for a store in IndexedDB.
 * Call on mount when online, and periodically refresh.
 */
export async function cacheProductCatalog(storeId: string): Promise<number> {
	try {
		const { data } = await client.query({
			query: GET_STORE_PRODUCTS_FOR_CACHE,
			variables: { storeId },
			fetchPolicy: "network-only",
		});

		const products = data?.storeProducts || [];
		if (products.length === 0) return 0;

		const db = await initDB();
		const tx = db.transaction("localInventory", "readwrite");

		// Clear old cache for this store
		const allItems = await tx.store.getAll();
		for (const item of allItems) {
			if (item.storeId === storeId) {
				await tx.store.delete(item.id);
			}
		}

		// Cache all products
		for (const product of products) {
			await tx.store.put({
				id: product.id,
				storeId,
				title: product.title,
				description: product.description,
				price: product.price,
				quantity: product.quantity,
				minQuantity: product.minQuantity,
				sku: product.sku,
				barcode: product.barcode,
				brand: product.brand,
				serialNumber: product.serialNumber,
				warrantyMonths: product.warrantyMonths,
				variants: product.variants,
				categoryId: product.categoryId,
				categoryName: product.category?.name,
				medias: product.medias || [],
				cachedAt: new Date().toISOString(),
			} as CachedProduct);
		}

		await tx.done;

		// Save sync metadata
		await saveToIndexedDB("syncMetadata", {
			key: `catalog_${storeId}`,
			lastSynced: new Date().toISOString(),
			productCount: products.length,
		});

		return products.length;
	} catch (error) {
		console.error("Failed to cache product catalog:", error);
		return 0;
	}
}

/**
 * Get cached products for offline use.
 */
export async function getCachedProducts(
	storeId: string,
): Promise<CachedProduct[]> {
	try {
		const allItems = await getAllFromIndexedDB("localInventory");
		return allItems.filter(
			(item: CachedProduct) => item.storeId === storeId,
		);
	} catch {
		return [];
	}
}

/**
 * Search cached products by title, SKU, or barcode.
 */
export async function searchCachedProducts(
	storeId: string,
	query: string,
): Promise<CachedProduct[]> {
	const products = await getCachedProducts(storeId);
	const q = query.toLowerCase();

	return products.filter(
		(p) =>
			p.title.toLowerCase().includes(q) ||
			p.sku?.toLowerCase().includes(q) ||
			p.barcode?.toLowerCase().includes(q) ||
			p.brand?.toLowerCase().includes(q),
	);
}

/**
 * Get a single cached product by ID.
 */
export async function getCachedProductById(
	productId: string,
): Promise<CachedProduct | null> {
	try {
		const { getFromIndexedDB } = await import("@/lib/indexed-db");
		return await getFromIndexedDB("localInventory", productId);
	} catch {
		return null;
	}
}
