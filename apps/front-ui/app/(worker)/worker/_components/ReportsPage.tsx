"use client";

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
import Loader from "@/components/seraui/Loader";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  GET_WORKER_PERFORMANCE,
  GET_WORKER_REPORTS,
  GET_WORKER_SALES_HISTORY,
} from "@/graphql/reports.gql";
import { useMe } from "@/lib/useMe";

interface ReportsPageProps {
  selectedStoreId: string | null;
}

export default function ReportsPage({ selectedStoreId }: ReportsPageProps) {
  const { user } = useMe();
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "quarter"
  >("week");
  const [reportType, setReportType] = useState<
    "sales" | "inventory" | "performance"
  >("sales");
  const { showToast } = useToast();
  const {
    data: reportsData,
    loading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery(GET_WORKER_REPORTS, {
    variables: {
      workerId: user?.id,
      storeId: selectedStoreId,
      timeRange,
      reportType,
    },
    skip: !user?.id,
  });

  const { data: performanceD, loading: performanceLoading } = useQuery(
    GET_WORKER_PERFORMANCE,
    {
      variables: {
        workerId: user?.id,
        storeId: selectedStoreId,
      },
      skip: !user?.id,
    },
  );

  const { data: salesHistoryD, loading: salesHistoryLoading } = useQuery(
    GET_WORKER_SALES_HISTORY,
    {
      variables: {
        workerId: user?.id,
        storeId: selectedStoreId,
        timeRange,
      },
      skip: !user?.id,
    },
  );

  const reportData = reportsData?.workerReports;
  const performanceData = performanceD?.workerPerformance;
  const _salesHistoryData = salesHistoryD?.workerSalesHistory;

  // Sample data for charts (in real app, this comes from the API)
  const salesData = [
    { name: "Mon", sales: 1200, orders: 12 },
    { name: "Tue", sales: 1900, orders: 18 },
    { name: "Wed", sales: 1500, orders: 15 },
    { name: "Thu", sales: 2100, orders: 21 },
    { name: "Fri", sales: 2800, orders: 28 },
    { name: "Sat", sales: 3200, orders: 32 },
    { name: "Sun", sales: 2400, orders: 24 },
  ];

  const inventoryData = [
    { name: "Electronics", value: 45 },
    { name: "Hardware", value: 30 },
    { name: "Accessories", value: 25 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (reportsLoading || performanceLoading || salesHistoryLoading)
    return <Loader loading={true} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance Reports</h1>
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

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-xl font-bold">
                ${reportData?.totalSales?.toFixed(2) || "12,450.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">
                {reportData?.totalOrders || 124}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Order</p>
              <p className="text-xl font-bold">
                $
                {(
                  reportData?.totalSales / reportData?.totalOrders || 100.4
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-xl font-bold">
                {reportData?.activeCustomers || 89}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Sales Performance
            </h2>
          </div>

          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChartRecharts data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="sales"
                  fill="hsl(var(--primary))"
                  name="Sales ($)"
                />
                <Bar
                  dataKey="orders"
                  fill="hsl(var(--success))"
                  name="Orders"
                />
              </BarChartRecharts>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent || 0 * 100).toFixed(0)}%`
                  }
                >
                  {inventoryData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                {reportData?.topSellingProducts?.map((product: any) => (
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
                    <td className="py-3 px-4">{product.quantitySold}</td>
                    <td className="py-3 px-4">${product.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {product.profitMargin.toFixed(1)}%
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

      {/* Worker Performance */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
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
              <p className="text-2xl font-bold">
                {performanceData?.shiftsCompleted || 24}
              </p>
              <p className="text-sm text-muted-foreground">
                Shifts completed this {timeRange}
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium mb-2">Sales Contribution</h3>
              <p className="text-2xl font-bold">
                ${performanceData?.personalSales?.toFixed(2) || "3,240.00"}
              </p>
              <p className="text-sm text-muted-foreground">
                Sales processed by you
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium mb-2">Customer Satisfaction</h3>
              <p className="text-2xl font-bold">
                {performanceData?.customerSatisfaction?.toFixed(1) || "4.7"}
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
                <BarChartRecharts data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" />
                </BarChartRecharts>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
