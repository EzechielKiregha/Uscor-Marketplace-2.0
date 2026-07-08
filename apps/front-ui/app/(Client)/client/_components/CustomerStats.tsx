"use client";

import { useQuery } from "@apollo/client";
import {
  Award,
  BarChart3,
  Calendar,
  DollarSign,
  Heart,
  Package,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { GET_CLIENT_ORDERS } from "@/graphql/client-panel.gql";

interface CustomerStatsProps {
  client: any;
}

export default function CustomerStats({ client }: CustomerStatsProps) {
  const { data, loading } = useQuery(GET_CLIENT_ORDERS, {
    variables: { clientId: client.id, limit: 200 },
  });

  const analytics = useMemo(() => {
    const orders = (data?.clientOrders?.items || []).filter(
      (o: any) => !o.clientOrderId,
    );
    const completedOrders = orders.filter(
      (o: any) => o.status === "DELIVERED" || o.status === "COMPLETED",
    );

    // Total spent
    const totalSpent = completedOrders.reduce(
      (sum: number, o: any) => sum + (o.totalAmount || 0),
      0,
    );

    // Average order value
    const avgOrder =
      completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;

    // Favorite store (most orders from)
    const storeCounts: Record<string, { name: string; avatar?: string; count: number; spent: number }> = {};
    for (const order of completedOrders) {
      const biz = order.business;
      if (!biz) continue;
      if (!storeCounts[biz.id]) {
        storeCounts[biz.id] = { name: biz.name, avatar: biz.avatar, count: 0, spent: 0 };
      }
      storeCounts[biz.id].count++;
      storeCounts[biz.id].spent += order.totalAmount || 0;
    }
    const favoriteStores = Object.values(storeCounts).sort(
      (a, b) => b.count - a.count,
    );

    // Most bought items
    const itemCounts: Record<string, { name: string; image?: string; count: number; spent: number }> = {};
    for (const order of completedOrders) {
      for (const item of order.items || []) {
        const key = item.name || item.id;
        if (!itemCounts[key]) {
          itemCounts[key] = {
            name: item.name,
            image: item.media?.[0]?.url,
            count: 0,
            spent: 0,
          };
        }
        itemCounts[key].count += item.quantity || 1;
        itemCounts[key].spent += (item.price || 0) * (item.quantity || 1);
      }
    }
    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly spending (last 6 months)
    const monthlySpending: { month: string; spent: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const monthOrders = completedOrders.filter((o: any) => {
        const oDate = new Date(o.createdAt);
        return (
          oDate.getMonth() === date.getMonth() &&
          oDate.getFullYear() === date.getFullYear()
        );
      });
      monthlySpending.push({
        month: monthKey,
        spent: monthOrders.reduce(
          (sum: number, o: any) => sum + (o.totalAmount || 0),
          0,
        ),
        orders: monthOrders.length,
      });
    }

    // Purchase frequency (avg days between orders)
    const orderDates = completedOrders
      .map((o: any) => new Date(o.createdAt).getTime())
      .sort();
    let avgDaysBetween = 0;
    if (orderDates.length > 1) {
      const gaps = [];
      for (let i = 1; i < orderDates.length; i++) {
        gaps.push(
          (orderDates[i] - orderDates[i - 1]) / (1000 * 60 * 60 * 24),
        );
      }
      avgDaysBetween =
        gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    }

    // Member since
    const memberSince = new Date(client.createdAt);
    const memberDays = Math.ceil(
      (now.getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      totalSpent,
      totalOrders: completedOrders.length,
      avgOrder,
      favoriteStores,
      topItems,
      monthlySpending,
      avgDaysBetween: Math.round(avgDaysBetween),
      memberDays,
      loyaltyPoints: client.loyaltyPoints || 0,
      loyaltyTier: client.loyaltyTier || "Standard",
    };
  }, [data, client]);

  const maxMonthlySpent = Math.max(
    ...analytics.monthlySpending.map((m) => m.spent),
    1,
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-page-title flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          My Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Your shopping patterns and spending insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Spent</span>
          </div>
          <p className="text-stat text-primary">
            ${analytics.totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Orders</span>
          </div>
          <p className="text-stat">{analytics.totalOrders}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg. Order</span>
          </div>
          <p className="text-stat">${analytics.avgOrder.toFixed(2)}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Frequency</span>
          </div>
          <p className="text-stat">
            {analytics.avgDaysBetween > 0
              ? `${analytics.avgDaysBetween}d`
              : "N/A"}
          </p>
          <p className="text-[10px] text-muted-foreground">between orders</p>
        </div>
      </div>

      {/* Loyalty + Member */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-orange-400/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Loyalty Status</h3>
            </div>
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
              {analytics.loyaltyTier}
            </Badge>
          </div>
          <p className="text-3xl font-bold">{analytics.loyaltyPoints}</p>
          <p className="text-xs text-muted-foreground">points earned</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Membership</h3>
          </div>
          <p className="text-3xl font-bold">{analytics.memberDays}</p>
          <p className="text-xs text-muted-foreground">
            days as a member since{" "}
            {new Date(client.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Monthly Spending Chart */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
        <div className="p-4 border-b border-border bg-muted">
          <h3 className="font-semibold text-sm">Monthly Spending</h3>
        </div>
        <div className="p-4">
          <div className="flex items-end gap-2 h-40">
            {analytics.monthlySpending.map((month) => (
              <div
                key={month.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-muted-foreground font-medium">
                  ${month.spent.toFixed(0)}
                </span>
                <div className="w-full relative">
                  <div
                    className="w-full bg-primary/20 rounded-t-sm mx-auto transition-all duration-300"
                    style={{
                      height: `${Math.max(4, (month.spent / maxMonthlySpent) * 100)}px`,
                    }}
                  >
                    <div
                      className="w-full bg-primary rounded-t-sm absolute bottom-0"
                      style={{
                        height: `${Math.max(2, (month.spent / maxMonthlySpent) * 100)}px`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {month.month}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {month.orders} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Favorite Stores */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 border-b border-border bg-muted">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Favorite Stores
            </h3>
          </div>
          <div className="divide-y divide-border">
            {analytics.favoriteStores.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                <Store className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No store data yet
              </div>
            ) : (
              analytics.favoriteStores.slice(0, 5).map((store, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">
                    #{i + 1}
                  </span>
                  {store.avatar ? (
                    <img
                      src={store.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{store.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {store.count} orders | ${store.spent.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 border-b border-border bg-muted">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Most Bought Items
            </h3>
          </div>
          <div className="divide-y divide-border">
            {analytics.topItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No item data yet
              </div>
            ) : (
              analytics.topItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">
                    #{i + 1}
                  </span>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Bought {item.count}x | ${item.spent.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
