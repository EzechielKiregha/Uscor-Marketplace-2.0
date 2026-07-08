"use client";

import { useQuery } from "@apollo/client";
import {
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Package,
    TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { GET_INVENTORY } from "@/graphql/inventory.gql";

interface LowStockAlertsProps {
  storeId: string;
  /** Compact mode for dashboard (badge + count). Expanded shows full list. */
  compact?: boolean;
}

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  minQuantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    medias?: Array<{ url: string }>;
    quantity: number;
    stockQuantity: number;
  };
}

export default function LowStockAlerts({
  storeId,
  compact = false,
}: LowStockAlertsProps) {
  const [expanded, setExpanded] = useState(false);

  const { data, loading } = useQuery(GET_INVENTORY, {
    variables: {
      storeId,
      lowStockOnly: true,
      page: 1,
      limit: 50,
    },
    skip: !storeId,
    pollInterval: 120000, // Refresh every minute
  });

  const lowStockItems: InventoryItem[] = data?.inventory?.items || [];
  const totalLowStock = data?.inventory?.total || 0;

  // Sort by severity: out of stock first, then by how far below threshold
  const sortedItems = [...lowStockItems].sort((a, b) => {
    const aRatio =
      a.minQuantity > 0 ? a.quantity / a.minQuantity : a.quantity;
    const bRatio =
      b.minQuantity > 0 ? b.quantity / b.minQuantity : b.quantity;
    return aRatio - bRatio;
  });

  const outOfStockCount = lowStockItems.filter(
    (item) => item.quantity === 0,
  ).length;
  const criticalCount = lowStockItems.filter(
    (item) =>
      item.quantity > 0 &&
      item.minQuantity > 0 &&
      item.quantity <= item.minQuantity * 0.5,
  ).length;

  // Compact mode: just a badge
  if (compact) {
    if (loading) return null;
    if (totalLowStock === 0) return null;

    return (
      <Badge
        variant={outOfStockCount > 0 ? "destructive" : "secondary"}
        className="gap-1"
      >
        <AlertTriangle className="h-3 w-3" />
        {totalLowStock} low stock
      </Badge>
    );
  }

  // Full card mode
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 card-hover">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-36 bg-muted rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (totalLowStock === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 card-hover">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4" />
          <span className="text-sm">All stock levels are healthy</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h3 className="font-semibold text-sm">Low Stock Alerts</h3>
          <Badge
            variant={outOfStockCount > 0 ? "destructive" : "secondary"}
            className="text-xs"
          >
            {totalLowStock}
          </Badge>
          {outOfStockCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {outOfStockCount} out of stock
            </Badge>
          )}
          {criticalCount > 0 && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
            >
              {criticalCount} critical
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded list */}
      {expanded && (
        <div className="border-t border-border max-h-64 overflow-y-auto">
          {sortedItems.map((item) => {
            const isOutOfStock = item.quantity === 0;
            const isCritical =
              item.quantity > 0 &&
              item.minQuantity > 0 &&
              item.quantity <= item.minQuantity * 0.5;
            const percentage =
              item.minQuantity > 0
                ? Math.round((item.quantity / item.minQuantity) * 100)
                : 0;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 border-b border-border last:border-b-0 ${
                  isOutOfStock ? "bg-destructive/5" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                  {item.product?.medias?.[0]?.url ? (
                    <img
                      src={item.product.medias[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.product?.title || "Unknown Product"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Stock bar */}
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isOutOfStock
                            ? "bg-destructive"
                            : isCritical
                              ? "bg-orange-500"
                              : "bg-warning"
                        }`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {item.quantity}/{item.minQuantity}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="text-[10px]">
                      Out
                    </Badge>
                  ) : isCritical ? (
                    <Badge
                      className="text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                    >
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                      {item.quantity}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.quantity} left
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
