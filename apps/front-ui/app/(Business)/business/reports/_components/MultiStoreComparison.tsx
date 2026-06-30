// app/business/reports/_components/MultiStoreComparison.tsx
"use client";

import { useQuery } from "@apollo/client";
import {
  ArrowUpRight,
  Building,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/chart-theme";
import { GET_STORES } from "@/graphql/store.gql";

const STORE_COLORS = CHART_COLORS.palette;

export default function MultiStoreComparison() {
  const { data: storesData, loading } = useQuery(GET_STORES);

  if (loading) {
    return (
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading store data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stores = storesData?.stores || [];

  if (stores.length < 2) {
    return (
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardContent className="py-12 text-center">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Multi-Store Comparison
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You need at least 2 stores to use the comparison dashboard. Create
            additional stores from the Stores page.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Compute per-store metrics
  const storeMetrics = stores.map((store: any, idx: number) => {
    const sales = store.sales || [];
    const completedSales = sales.filter((s: any) => s.status === "COMPLETED");
    const totalRevenue = completedSales.reduce(
      (sum: number, s: any) => sum + (s.totalAmount || 0),
      0,
    );
    const totalProducts = store.products?.length || 0;
    const totalWorkers = store.workers?.length || 0;
    const lowStockProducts =
      store.products?.filter(
        (p: any) => p.quantity < (p.minQuantity || 5),
      ).length || 0;
    const avgTicket =
      completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

    return {
      id: store.id,
      name: store.name,
      address: store.address,
      color: STORE_COLORS[idx % STORE_COLORS.length],
      revenue: totalRevenue,
      salesCount: completedSales.length,
      totalProducts,
      totalWorkers,
      lowStockProducts,
      avgTicket,
    };
  });

  // Sort by revenue for ranking
  const sorted = [...storeMetrics].sort((a, b) => b.revenue - a.revenue);
  const topStore = sorted[0];
  const totalRevenueAll = storeMetrics.reduce(
    (sum: number, s: any) => sum + s.revenue,
    0,
  );

  // Chart data
  const chartData = storeMetrics.map((s: any) => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + "..." : s.name,
    revenue: s.revenue,
    sales: s.salesCount,
    products: s.totalProducts,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Multi-Store Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Side-by-side performance metrics across {stores.length} stores
          </p>
        </CardHeader>
      </Card>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Stores</span>
            </div>
            <p className="text-2xl font-bold">{stores.length}</p>
            <p className="text-xs text-muted-foreground">active locations</p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">${totalRevenueAll.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">across all stores</p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Top Store</span>
            </div>
            <p className="text-lg font-bold truncate">{topStore?.name}</p>
            <p className="text-xs text-muted-foreground">
              ${topStore?.revenue.toFixed(2)} revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Staff</span>
            </div>
            <p className="text-2xl font-bold">
              {storeMetrics.reduce((sum: number, s: any) => sum + s.totalWorkers, 0)}
            </p>
            <p className="text-xs text-muted-foreground">across all stores</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Comparison Chart */}
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Revenue & Sales Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === "revenue"
                      ? `$${Number(value).toFixed(2)}`
                      : `${value}`,
                    name === "revenue"
                      ? "Revenue"
                      : name === "sales"
                        ? "Sales"
                        : "Products",
                  ]}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill={CHART_COLORS.primary}
                  name="Revenue ($)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="sales"
                  fill={CHART_COLORS.secondary}
                  name="Sales (#)"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((store: any, idx: number) => {
          const revenueShare =
            totalRevenueAll > 0
              ? ((store.revenue / totalRevenueAll) * 100).toFixed(1)
              : "0";
          return (
            <Card
              key={store.id}
              className="border border-orange-400/60 dark:border-orange-500/70 bg-card overflow-hidden"
            >
              <div
                className="h-1"
                style={{ backgroundColor: store.color }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {idx === 0 && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        #1
                      </span>
                    )}
                    {store.name}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {revenueShare}% of total
                  </span>
                </div>
                {store.address && (
                  <p className="text-xs text-muted-foreground">{store.address}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-bold">
                      ${store.revenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Sales</p>
                    <p className="text-sm font-bold">{store.salesCount}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Avg Ticket</p>
                    <p className="text-sm font-bold">
                      ${store.avgTicket.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="text-sm font-bold">{store.totalProducts}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Workers</p>
                    <p className="text-sm font-bold">{store.totalWorkers}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Low Stock</p>
                    <p
                      className={`text-sm font-bold ${store.lowStockProducts > 0 ? "text-red-500" : ""}`}
                    >
                      {store.lowStockProducts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
