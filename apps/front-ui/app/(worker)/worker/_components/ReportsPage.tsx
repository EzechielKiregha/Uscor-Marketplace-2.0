"use client";

import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import {
    GET_WORKER_PERFORMANCE,
    GET_WORKER_REPORTS,
    GET_WORKER_SALES_HISTORY,
} from "@/graphql/reports.gql";
import { CHART_COLORS } from "@/lib/chart-theme";
import { useMe } from "@/lib/useMe";
import { useQuery } from "@apollo/client";
import {
    BarChart,
    Clock,
    DollarSign,
    Download,
    Package,
    PieChart,
    ShoppingCart,
    Star,
    TrendingUp,
    Users,
} from "lucide-react";
import { useState } from "react";
import {
    Bar,
    BarChart as BarChartRecharts,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface ReportsPageProps {
  selectedStoreId: string | null;
  viewMode?: "worker" | "business"; // New prop
  workerId?: string;
}

export default function ReportsPage({
  selectedStoreId,
  viewMode = "worker",
  workerId,
}: ReportsPageProps) {
  const { user } = useMe();
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "quarter"
  >("week");
  const [reportType, setReportType] = useState<
    "sales" | "inventory" | "performance"
  >("sales");

  const effectiveWorkerId =
    viewMode === "business" && workerId ? workerId : user?.id;

  const showActions = viewMode === "worker";

  const {
    data: reportsData,
    loading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery(GET_WORKER_REPORTS, {
    variables: {
      workerId: effectiveWorkerId,
      storeId: selectedStoreId,
      timeRange,
      reportType,
    },
    skip: !effectiveWorkerId,
  });

  const { data: performanceD, loading: performanceLoading } = useQuery(
    GET_WORKER_PERFORMANCE,
    {
      variables: {
        workerId: effectiveWorkerId,
        storeId: selectedStoreId,
        timeRange,
      },
      skip: !effectiveWorkerId,
    },
  );

  const { data: salesHistoryD, loading: salesHistoryLoading } = useQuery(
    GET_WORKER_SALES_HISTORY,
    {
      variables: {
        workerId: effectiveWorkerId,
        storeId: selectedStoreId,
        timeRange,
      },
      skip: !effectiveWorkerId,
    },
  );

  const reportData = reportsData?.workerReports?.items?.[0];
  const performanceData = performanceD?.workerPerformance;
  const salesHistoryData = salesHistoryD?.workerSalesHistory;

  const salesChartData = (performanceData?.salesByHour || []).map(
    (item: any) => ({
      name: item.hour,
      sales: Number(item.sales || 0),
    }),
  );

  const inventoryData = (reportData?.topSellingProducts || []).map(
    (item: any) => ({
      name: item.title || "Product",
      value: Number(item.revenue || 0),
    }),
  );

  const COLORS = CHART_COLORS.palette;

  if (reportsLoading || performanceLoading || salesHistoryLoading)
    return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">Performance Reports</h1>
        <p className="text-muted-foreground">
          View your performance metrics and business analytics
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="performance">Performance Report</option>
          </select>
        </div>

        {showActions && (
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-stat">
                ${Number(reportData?.totalSales || 0).toFixed(2)}
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
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-stat">{reportData?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Order</p>
              <p className="text-stat">
                ${Number(reportData?.averageOrderValue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-stat">{reportData?.activeCustomers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 bg-muted border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Sales Performance
            </h2>
          </div>

          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChartRecharts
                data={salesChartData.length ? salesChartData : []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="sales"
                  fill={CHART_COLORS.primary}
                  name="Sales ($)"
                />
              </BarChartRecharts>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 bg-muted border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Inventory Distribution
            </h2>
          </div>

          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData.length ? inventoryData : []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={CHART_COLORS.accent}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {(
                    inventoryData as Array<{ name: string; value: number }>
                  ).map(
                    (entry: { name: string; value: number }, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Detailed Report
          </h2>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 font-medium">Product</th>
                  <th className="py-3 px-4 font-medium">Quantity Sold</th>
                  <th className="py-3 px-4 font-medium">Revenue</th>
                  <th className="py-3 px-4 font-medium">Profit Margin</th>
                  <th className="py-3 px-4 font-medium">Customer Rating</th>
                </tr>
              </thead>
              <tbody>
                {(reportData?.topSellingProducts || []).map((product: any) => (
                  <tr
                    key={product.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <span>{product.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{product.quantitySold || 0}</td>
                    <td className="py-3 px-4">
                      ${Number(product.revenue || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {Number(product.profitMargin || 0).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span>
                          {product.averageRating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Sales History */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Sales
          </h2>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 font-medium">Order</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(salesHistoryData?.items || []).map((sale: any) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-4">{sale.orderNumber}</td>
                    <td className="py-3 px-4">
                      {sale.client?.fullName || "Walk-in"}
                    </td>
                    <td className="py-3 px-4">
                      ${Number(sale.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">{sale.paymentMethod || "-"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs bg-success/10 text-success">
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {!salesHistoryData?.items?.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 px-4 text-center text-muted-foreground"
                    >
                      No sales in this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Worker Performance */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Performance
          </h2>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium mb-2">Shift Performance</h3>
              <p className="text-stat">
                {performanceData?.shiftsCompleted || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Shifts completed this {timeRange}
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium mb-2">Sales Contribution</h3>
              <p className="text-stat">
                ${Number(performanceData?.personalSales || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Sales processed by you
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium mb-2">Customer Satisfaction</h3>
              <p className="text-stat">
                {Number(performanceData?.customerSatisfaction || 0).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                Average rating from customers
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Performance Trends</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChartRecharts
                  data={salesChartData.length ? salesChartData : []}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill={CHART_COLORS.primary} />
                </BarChartRecharts>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
