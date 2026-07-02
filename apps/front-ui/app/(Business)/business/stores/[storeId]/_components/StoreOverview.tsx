"use client";

import { Button } from "@/components/ui/button";
import { CHART_COLORS } from "@/lib/chart-theme";
import {
    AlertTriangle,
    ArrowRight,
    BarChart,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Users
} from "lucide-react";
import { useState } from "react";
import {
    Bar,
    BarChart as BarChartRecharts,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface StoreOverviewProps {
  store: any;
  stats: any;
  workers: any[];
}

export default function StoreOverview({
  store,
  stats,
  workers,
}: StoreOverviewProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  const salesData = [
    { name: "Mon", sales: stats?.dailySales?.[0]?.sales || 1200, orders: 12 },
    { name: "Tue", sales: stats?.dailySales?.[1]?.sales || 1900, orders: 18 },
    { name: "Wed", sales: stats?.dailySales?.[2]?.sales || 1500, orders: 15 },
    { name: "Thu", sales: stats?.dailySales?.[3]?.sales || 2100, orders: 21 },
    { name: "Fri", sales: stats?.dailySales?.[4]?.sales || 2800, orders: 28 },
    { name: "Sat", sales: stats?.dailySales?.[5]?.sales || 3200, orders: 32 },
    { name: "Sun", sales: stats?.dailySales?.[6]?.sales || 2400, orders: 24 },
  ];

  const topProducts = stats?.topSellingProducts || [
    { id: "1", title: "Wireless Earbuds", quantitySold: 45, revenue: 2250 },
    { id: "2", title: "Phone Case", quantitySold: 38, revenue: 950 },
    { id: "3", title: "USB-C Cable", quantitySold: 32, revenue: 640 },
  ];

  const recentSales = stats?.recentSales || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Workers</p>
              <p className="text-xl font-bold">
                {stats?.activeWorkers ||
                  workers.filter((w) => w.currentShift).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Sales</p>
              <p className="text-xl font-bold">
                ${stats?.todaySales?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-xl font-bold">{stats?.lowStockItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Shifts</p>
              <p className="text-xl font-bold">{stats?.activeShifts || 0}</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Sales Performance
            </h3>
            <div className="flex gap-1">
              <Button
                variant={timeRange === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("day")}
              >
                Day
              </Button>
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("week")}
              >
                Week
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("month")}
              >
                Month
              </Button>
            </div>
          </div>

          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChartRecharts data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                <Bar
                  dataKey="sales"
                  fill={CHART_COLORS.primary}
                  name="Sales ($)"
                />
              </BarChartRecharts>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 bg-muted border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Status
            </h3>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-success">
                  {stats?.inventoryStatus?.inStockCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">In Stock</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-warning">
                  {stats?.inventoryStatus?.lowStockCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-destructive">
                  {stats?.inventoryStatus?.outOfStockCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
              </div>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Selling Products
            </h3>
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {topProducts.map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantitySold} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ${product.revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Sales
            </h3>
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="p-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentSales.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent sales</p>
                </div>
              ) : (
                recentSales.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Order #{sale.id.substring(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleDateString()} •{" "}
                        {sale.worker?.fullName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          sale.status === "COMPLETED"
                            ? "text-success"
                            : sale.status === "PENDING"
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        ${sale.totalAmount.toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          sale.status === "COMPLETED"
                            ? "bg-success/10 text-success"
                            : sale.status === "PENDING"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Worker Performance Summary */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
        <div className="p-4 bg-muted border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Worker Performance Summary
          </h3>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Today's Sales</th>
                  <th className="py-3 px-4">Shift Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.slice(0, 5).map((worker: any) => (
                  <tr
                    key={worker.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {worker.avatar ? (
                          <img
                            src={worker.avatar}
                            alt={worker.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                            {worker.fullName.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{worker.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">
                      {worker.role.toLowerCase()}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      ${worker.todaySales?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          worker.currentShift
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {worker.currentShift ? "On Shift" : "Off Shift"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/business/stores/${store?.id}/workers/${worker.id}`)
                        }
                      >
                        View <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {workers.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Workers
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Business Type Specific Tips */}
      <div className="bg-card border border-border rounded-lg p-4 card-hover">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Store Optimization Tips</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {store?.business?.businessType === "ELECTRONICS" && (
                <>
                  Electronics stores benefit from tracking warranty periods and
                  offering repair services. Consider promoting accessories
                  alongside main products to increase average ticket value.
                </>
              )}
              {store?.business?.businessType === "HARDWARE" && (
                <>
                  Hardware stores should focus on seasonal inventory planning
                  and bulk order discounts. Track tool rentals and service
                  appointments to maximize revenue per customer.
                </>
              )}
              {store?.business?.businessType === "GROCERY" && (
                <>
                  Grocery stores need real-time stock tracking for perishables.
                  Set up automatic reorder alerts for fast-moving items to
                  prevent stockouts.
                </>
              )}
              {store?.business?.businessType !== "ELECTRONICS" &&
                store?.business?.businessType !== "HARDWARE" &&
                store?.business?.businessType !== "GROCERY" && (
                  <>
                    Monitor your top-selling products and ensure adequate stock
                    levels. Train workers on upselling techniques to increase
                    average transaction value.
                  </>
                )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
