"use client";

import { Heart, Plus, Search, Star, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    type CachedProduct,
    getCachedProducts,
    searchCachedProducts,
} from "@/lib/catalog-cache";
import {
    getAllFromIndexedDB,
    getFromIndexedDB,
    initDB,
    saveToIndexedDB,
} from "@/lib/indexed-db";

// ─── Types ─────────────────────────────────────────────

interface FavoriteProduct {
  id: string;
  productId: string;
  storeId: string;
  usageCount: number;
  isFavorite: boolean;
  lastUsed: string;
}

interface QuickSaleGridProps {
  storeId: string;
  onProductSelect: (productId: string, quantity?: number) => void;
}

// ─── IndexedDB Favorites Store ─────────────────────────

const FAVORITES_STORE = "workerCache";
const FAVORITES_KEY_PREFIX = "fav_";
const USAGE_KEY_PREFIX = "usage_";

async function getFavorites(storeId: string): Promise<FavoriteProduct[]> {
  try {
    const allItems = await getAllFromIndexedDB(FAVORITES_STORE);
    return allItems
      .filter(
        (item: any) =>
          item.key?.startsWith(FAVORITES_KEY_PREFIX) &&
          item.data?.storeId === storeId,
      )
      .map((item: any) => item.data as FavoriteProduct);
  } catch {
    return [];
  }
}

async function toggleFavorite(
  productId: string,
  storeId: string,
): Promise<boolean> {
  const key = `${FAVORITES_KEY_PREFIX}${storeId}_${productId}`;
  const existing = await getFromIndexedDB(FAVORITES_STORE, key);

  if (existing) {
    const updated = {
      ...existing,
      data: {
        ...existing.data,
        isFavorite: !existing.data.isFavorite,
      },
      timestamp: new Date().toISOString(),
    };
    await saveToIndexedDB(FAVORITES_STORE, updated);
    return updated.data.isFavorite;
  }

  // Create new favorite entry
  await saveToIndexedDB(FAVORITES_STORE, {
    key,
    data: {
      id: key,
      productId,
      storeId,
      usageCount: 0,
      isFavorite: true,
      lastUsed: new Date().toISOString(),
    } as FavoriteProduct,
    timestamp: new Date().toISOString(),
  });

  return true;
}

async function trackProductUsage(
  productId: string,
  storeId: string,
): Promise<void> {
  const key = `${FAVORITES_KEY_PREFIX}${storeId}_${productId}`;
  const existing = await getFromIndexedDB(FAVORITES_STORE, key);

  if (existing) {
    await saveToIndexedDB(FAVORITES_STORE, {
      ...existing,
      data: {
        ...existing.data,
        usageCount: (existing.data.usageCount || 0) + 1,
        lastUsed: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    await saveToIndexedDB(FAVORITES_STORE, {
      key,
      data: {
        id: key,
        productId,
        storeId,
        usageCount: 1,
        isFavorite: false,
        lastUsed: new Date().toISOString(),
      } as FavoriteProduct,
      timestamp: new Date().toISOString(),
    });
  }
}

// ─── Component ─────────────────────────────────────────

export default function QuickSaleGrid({
  storeId,
  onProductSelect,
}: QuickSaleGridProps) {
  const [products, setProducts] = useState<CachedProduct[]>([]);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"favorites" | "frequent" | "all">(
    "all",
  );
  const [loading, setLoading] = useState(true);

  // Load products and favorites
  useEffect(() => {
    if (!storeId) return;

    async function load() {
      setLoading(true);
      await initDB();
      const [cachedProducts, favs] = await Promise.all([
        getCachedProducts(storeId),
        getFavorites(storeId),
      ]);
      setProducts(cachedProducts);
      setFavorites(favs);
      setLoading(false);
    }

    load();
  }, [storeId]);

//   console.log({"Cached Products" : products})

  // Search products
  useEffect(() => {
    if (!searchQuery.trim() || !storeId) return;

    const timeout = setTimeout(async () => {
      const results = await searchCachedProducts(storeId, searchQuery);
      setProducts(results);
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchQuery, storeId]);

  // Reset to full list when search is cleared
  useEffect(() => {
    if (!searchQuery.trim() && storeId) {
      getCachedProducts(storeId).then(setProducts);
    }
  }, [searchQuery, storeId]);

  const handleProductTap = useCallback(
    async (product: CachedProduct) => {
      // Track usage for "frequent" sorting
      await trackProductUsage(product.id, storeId);
      onProductSelect(product.id, 1);

      // Update local favorites state
      const updatedFavs = await getFavorites(storeId);
      setFavorites(updatedFavs);
    },
    [storeId, onProductSelect],
  );

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent, productId: string) => {
      e.stopPropagation();
      await toggleFavorite(productId, storeId);
      const updatedFavs = await getFavorites(storeId);
      setFavorites(updatedFavs);
    },
    [storeId],
  );

  // Filter and sort products based on view
  const displayProducts = (() => {
    if (searchQuery.trim()) return products;

    const favMap = new Map(favorites.map((f) => [f.productId, f]));

    if (view === "favorites") {
      const favoriteIds = new Set(
        favorites.filter((f) => f.isFavorite).map((f) => f.productId),
      );
      return products.filter((p) => favoriteIds.has(p.id));
    }

    if (view === "frequent") {
      return [...products].sort((a, b) => {
        const aUsage = favMap.get(a.id)?.usageCount || 0;
        const bUsage = favMap.get(b.id)?.usageCount || 0;
        return bUsage - aUsage;
      });
    }

    return products;
  })();

  const isFavorite = (productId: string) =>
    favorites.some((f) => f.productId === productId && f.isFavorite);

  const getUsageCount = (productId: string) =>
    favorites.find((f) => f.productId === productId)?.usageCount || 0;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Quick Sale</h3>
          <Badge variant="secondary" className="text-xs">
            {displayProducts.length} items
          </Badge>
        </div>

        {/* View Tabs */}
        <div className="flex gap-1">
          <Button
            variant={view === "favorites" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setView("favorites")}
          >
            <Heart className="h-3 w-3 mr-1" />
            Favorites
          </Button>
          <Button
            variant={view === "frequent" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setView("frequent")}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Frequent
          </Button>
          <Button
            variant={view === "all" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setView("all")}
          >
            All
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm pl-8"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-2 max-h-64 overflow-y-auto">
        {displayProducts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {view === "favorites" ? (
              <>
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No favorite products yet</p>
                <p className="text-xs mt-1">
                  Tap the heart icon on any product to add it here
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => setView("all")}
                >
                  Browse all products
                </Button>
              </>
            ) : searchQuery ? (
              <p className="text-sm">No products match "{searchQuery}"</p>
            ) : (
              <p className="text-sm">No cached products available</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
            {displayProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductTap(product)}
                className="relative group border border-border rounded-lg p-2 hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                {/* Favorite toggle */}
                <button
                  onClick={(e) => handleToggleFavorite(e, product.id)}
                  className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      isFavorite(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>

                {/* Product thumbnail */}
                <div className="w-full aspect-square rounded bg-muted mb-1.5 overflow-hidden">
                  {product.medias?.[0]?.url ? (
                    <img
                      src={product.medias[0].url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Plus className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Product info */}
                <p className="text-xs font-medium line-clamp-1">
                  {product.title}
                </p>
                <p className="text-xs text-primary font-bold">
                  ${product.price.toFixed(2)}
                </p>

                {/* Usage count badge */}
                {getUsageCount(product.id) > 0 && (
                  <span className="absolute bottom-1 right-1 text-[10px] text-muted-foreground bg-muted rounded-full px-1">
                    {getUsageCount(product.id)}x
                  </span>
                )}

                {/* Favorite indicator (always visible) */}
                {isFavorite(product.id) && (
                  <Heart className="absolute top-1 right-1 h-3 w-3 fill-red-500 text-red-500 group-hover:opacity-0 transition-opacity" />
                )}

                {/* Low stock warning */}
                {product.quantity <= product.minQuantity && (
                  <span className="absolute top-1 left-1 text-[10px] bg-destructive/10 text-destructive rounded px-1">
                    Low
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
