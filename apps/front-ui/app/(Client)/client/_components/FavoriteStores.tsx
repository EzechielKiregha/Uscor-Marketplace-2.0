"use client";

import { useQuery } from "@apollo/client";
import {
  ExternalLink,
  Heart,
  HeartOff,
  MapPin,
  Plug,
  Search,
  Store,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUSINESS_TYPES } from "@/config/business-types";
import { GET_CLIENT_ORDERS } from "@/graphql/client-panel.gql";

interface FavoriteStoresProps {
  client: any;
}

interface FavoriteStore {
  businessId: string;
  name: string;
  avatar?: string;
  businessType?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  isFavorite: boolean;
}

// LocalStorage key
const FAVORITES_KEY = "uscor_favorite_stores";

function getSavedFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export default function FavoriteStores({ client }: FavoriteStoresProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"favorites" | "all">("favorites");

  useEffect(() => {
    setFavoriteIds(getSavedFavorites());
  }, []);

  const { data, loading } = useQuery(GET_CLIENT_ORDERS, {
    variables: { clientId: client.id, limit: 200 },
  });

  // Build store list from order history
  const allStores: FavoriteStore[] = useMemo(() => {
    const orders = (data?.clientOrders?.items || []).filter(
      (o: any) => !o.clientOrderId,
    );
    const storeMap: Record<string, FavoriteStore> = {};

    for (const order of orders) {
      const biz = order.business;
      if (!biz) continue;

      if (!storeMap[biz.id]) {
        storeMap[biz.id] = {
          businessId: biz.id,
          name: biz.name,
          avatar: biz.avatar,
          businessType: biz.businessType,
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          isFavorite: favoriteIds.includes(biz.id),
        };
      }

      storeMap[biz.id].orderCount++;
      storeMap[biz.id].totalSpent += order.totalAmount || 0;
      if (
        new Date(order.createdAt) > new Date(storeMap[biz.id].lastOrderDate)
      ) {
        storeMap[biz.id].lastOrderDate = order.createdAt;
      }
      storeMap[biz.id].isFavorite = favoriteIds.includes(biz.id);
    }

    return Object.values(storeMap).sort((a, b) => b.orderCount - a.orderCount);
  }, [data, favoriteIds]);

  const toggleFavorite = useCallback((businessId: string) => {
    setFavoriteIds((prev) => {
      const updated = prev.includes(businessId)
        ? prev.filter((id) => id !== businessId)
        : [...prev, businessId];
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const displayStores = useMemo(() => {
    let stores =
      view === "favorites"
        ? allStores.filter((s) => favoriteIds.includes(s.businessId))
        : allStores;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      stores = stores.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.businessType?.toLowerCase().includes(q),
      );
    }

    return stores;
  }, [allStores, favoriteIds, view, searchQuery]);

  const getTypeConfig = (type?: string) => {
    if (!type) return null;
    return BUSINESS_TYPES[type as keyof typeof BUSINESS_TYPES] || null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-page-title flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Favorite Stores
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your favorite businesses for quick access
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-1">
          <Button
            variant={view === "favorites" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("favorites")}
            className="gap-1"
          >
            <Heart className="h-3.5 w-3.5" />
            Favorites
            <Badge variant="secondary" className="text-[10px] ml-1">
              {favoriteIds.length}
            </Badge>
          </Button>
          <Button
            variant={view === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("all")}
          >
            All ({allStores.length})
          </Button>
        </div>
      </div>

      {/* Store Grid */}
      {displayStores.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          {view === "favorites" ? (
            <>
              <HeartOff className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No favorite stores yet</p>
              <p className="text-xs mt-1">
                Browse all stores and tap the heart to save your favorites
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setView("all")}
                className="mt-2"
              >
                Browse all stores
              </Button>
            </>
          ) : (
            <>
              <Store className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No stores found</p>
              <p className="text-xs mt-1">
                Stores you've ordered from will appear here
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayStores.map((store) => {
            const typeConfig = getTypeConfig(store.businessType);
            const Icon = typeConfig ? typeConfig.icon : Plug;
            return (
              <div
                key={store.businessId}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-colors group"
              >
                {/* Type accent bar */}
                {typeConfig && (
                  <div
                    className="h-1"
                    style={{ backgroundColor: typeConfig.color }}
                  />
                )}

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {store.avatar ? (
                      <img
                        src={store.avatar}
                        alt={store.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {store.name}
                      </h3>
                      {typeConfig && (
                        <p className="text-xs text-muted-foreground">
                          <Icon
                            className={`h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary`}
                          />{" "}
                          {typeConfig.label}
                        </p>
                      )}
                    </div>

                    {/* Favorite button */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(store.businessId)}
                      className="shrink-0"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          favoriteIds.includes(store.businessId)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="text-sm font-bold">{store.orderCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="text-sm font-bold">
                        ${store.totalSpent.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last</p>
                      <p className="text-sm font-medium">
                        {new Date(store.lastOrderDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* View Store Link */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs gap-1"
                    onClick={() =>
                      (window.location.href = `/marketplace?business=${store.businessId}`)
                    }
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit Store
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
