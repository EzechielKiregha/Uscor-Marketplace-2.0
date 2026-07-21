"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GET_CLIENT_ORDERS } from "@/graphql/client-panel.gql";
import { useQuery } from "@apollo/client";
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Package,
    Shield,
    ShieldAlert,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface WarrantyTrackerProps {
  client: any;
}

interface WarrantyItem {
  productId: string;
  productName: string;
  productImage?: string;
  businessName: string;
  purchaseDate: string;
  warrantyMonths: number;
  expiryDate: Date;
  daysRemaining: number;
  status: "active" | "expiring" | "expired";
  orderId: string;
  orderNumber: string;
  serialNumber?: string;
}

export default function WarrantyTracker({ client }: WarrantyTrackerProps) {
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired">("all");

  const { data, loading } = useQuery(GET_CLIENT_ORDERS, {
    variables: { clientId: client.id, limit: 100 },
  });

  const warrantyItems: WarrantyItem[] = useMemo(() => {
    const orders = data?.clientOrders?.items || [];
    const items: WarrantyItem[] = [];
    const now = new Date();

    for (const order of orders) {
      if (order.status !== "DELIVERED" && order.status !== "COMPLETED") continue;

      for (const item of order.items || []) {
        // Check if product has warranty info (from product metadata or name patterns)
        // Since warrantyMonths may be on the product entity, check for it
        const warrantyMonths = item.warrantyMonths || item.product?.warrantyMonths;
        if (!warrantyMonths || warrantyMonths <= 0) continue;

        const purchaseDate = new Date(order.createdAt);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

        const daysRemaining = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        let status: "active" | "expiring" | "expired";
        if (daysRemaining <= 0) {
          status = "expired";
        } else if (daysRemaining <= 30) {
          status = "expiring";
        } else {
          status = "active";
        }

        items.push({
          productId: item.productId || item.id,
          productName: item.name || item.product?.title || "Unknown Product",
          productImage: item.media?.[0]?.url || item.product?.medias?.[0]?.url,
          businessName: order.business?.name || "Unknown Business",
          purchaseDate: order.createdAt,
          warrantyMonths,
          expiryDate,
          daysRemaining,
          status,
          orderId: order.id,
          orderNumber: order.orderNumber || order.id.substring(0, 8),
          serialNumber: item.serialNumber || item.product?.serialNumber,
        });
      }
    }

    return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [data]);

  const filteredItems = filter === "all"
    ? warrantyItems
    : warrantyItems.filter((item) => item.status === filter);

  const counts = {
    all: warrantyItems.length,
    active: warrantyItems.filter((i) => i.status === "active").length,
    expiring: warrantyItems.filter((i) => i.status === "expiring").length,
    expired: warrantyItems.filter((i) => i.status === "expired").length,
  };

  if (loading) {
    return (
      <div className="bg-card border hover:border-primary  rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-page-title flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Warranty Tracker
        </h1>
        <p className="text-muted-foreground text-sm">
          Track warranty status for your purchased products
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "expiring", "expired"] as const).map((tab) => {
          const icons = {
            all: Shield,
            active: ShieldCheck,
            expiring: ShieldAlert,
            expired: XCircle,
          };
          const Icon = icons[tab];
          return (
            <Button
              key={tab}
              variant={filter === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tab)}
              className="gap-1"
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <Badge
                variant="secondary"
                className="ml-1 text-[10px] px-1.5"
              >
                {counts[tab]}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Warranty List */}
      {filteredItems.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {filter === "all"
              ? "No products with warranty found"
              : `No ${filter} warranties`}
          </p>
          <p className="text-xs mt-1">
            Products with warranty information from your orders will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => (
            <div
              key={`${item.productId}-${idx}`}
              className={`bg-card border rounded-lg overflow-hidden ${
                item.status === "expired"
                  ? "border-border opacity-70"
                  : item.status === "expiring"
                    ? "border-orange-400/60"
                    : "border-border"
              }`}
            >
              <div className="p-4 flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.businessName} | Order #{item.orderNumber}
                      </p>
                      {item.serialNumber && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          S/N: {item.serialNumber}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    {item.status === "active" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                    {item.status === "expiring" && (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Expiring Soon
                      </Badge>
                    )}
                    {item.status === "expired" && (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Expired
                      </Badge>
                    )}
                  </div>

                  {/* Warranty Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Purchased</p>
                        <p className="font-medium">
                          {new Date(item.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Coverage</p>
                        <p className="font-medium">
                          {item.warrantyMonths} months
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium">
                          {item.expiryDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p
                          className={`font-medium ${
                            item.status === "expired"
                              ? "text-destructive"
                              : item.status === "expiring"
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {item.daysRemaining <= 0
                            ? `Expired ${Math.abs(item.daysRemaining)} days ago`
                            : `${item.daysRemaining} days`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {item.status !== "expired" && (
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "expiring"
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.max(
                              5,
                              (item.daysRemaining / (item.warrantyMonths * 30)) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
