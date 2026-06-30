// app/business/reports/_components/DailyClosing.tsx
"use client";

import { useQuery } from "@apollo/client";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Package,
  Receipt,
  RotateCcw,
  TrendingDown,
  TrendingUp,
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
} from "recharts";
import { CHART_COLORS } from "@/lib/chart-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_SALES_DASHBOARD } from "@/graphql/sales.gql";
import { GET_SALES_HISTORY } from "@/graphql/sales.gql";
import { exportSalesCSV } from "@/lib/export-utils";
import { downloadSalesReportPDF } from "@/lib/pdf/sales-report-pdf";

interface DailyClosingProps {
  storeId: string;
  storeName: string;
}

export default function DailyClosing({ storeId, storeName }: DailyClosingProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Get the start and end of the selected date
  const startDate = new Date(selectedDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  const { data: dashboardData, loading: dashLoading } = useQuery(
    GET_SALES_DASHBOARD,
    {
      variables: { storeId, period: "day" },
      skip: !storeId,
    },
  );

  const { data: salesData, loading: salesLoading } = useQuery(
    GET_SALES_HISTORY,
    {
      variables: {
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 200,
      },
      skip: !storeId,
    },
  );

  const loading = dashLoading || salesLoading;

  if (loading) {
    return (
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading closing report...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dashboard = dashboardData?.salesDashboard;
  const sales = salesData?.salesHistory?.items || [];

  // Compute daily metrics from actual sales
  const totalRevenue = sales.reduce(
    (sum: number, s: any) => sum + (s.status === "COMPLETED" ? s.totalAmount : 0),
    0,
  );
  const totalDiscount = sales.reduce(
    (sum: number, s: any) => sum + (s.discount || 0),
    0,
  );
  const completedSales = sales.filter((s: any) => s.status === "COMPLETED");
  const refundedSales = sales.filter((s: any) => s.status === "REFUNDED");
  const openSales = sales.filter((s: any) => s.status === "OPEN");
  const refundTotal = refundedSales.reduce(
    (sum: number, s: any) => sum + s.totalAmount,
    0,
  );
  const avgTicket =
    completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
  const netRevenue = totalRevenue - refundTotal;

  // Payment method breakdown
  const paymentBreakdown: Record<string, { count: number; amount: number }> = {};
  completedSales.forEach((sale: any) => {
    const method = sale.paymentMethod || "UNKNOWN";
    if (!paymentBreakdown[method]) {
      paymentBreakdown[method] = { count: 0, amount: 0 };
    }
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].amount += sale.totalAmount;
  });

  // Top products from completed sales
  const productMap: Record<string, { title: string; qty: number; revenue: number }> =
    {};
  completedSales.forEach((sale: any) => {
    sale.saleProducts?.forEach((sp: any) => {
      const id = sp.product?.id || sp.productId;
      if (!productMap[id]) {
        productMap[id] = {
          title: sp.product?.title || "Unknown",
          qty: 0,
          revenue: 0,
        };
      }
      productMap[id].qty += sp.quantity;
      productMap[id].revenue += sp.price * sp.quantity;
    });
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Hourly breakdown for chart
  const hourlyData: { hour: string; sales: number; transactions: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const hourSales = completedSales.filter((s: any) => {
      const saleHour = new Date(s.createdAt).getHours();
      return saleHour === h;
    });
    if (hourSales.length > 0 || (h >= 6 && h <= 22)) {
      hourlyData.push({
        hour: `${h.toString().padStart(2, "0")}:00`,
        sales: hourSales.reduce((sum: number, s: any) => sum + s.totalAmount, 0),
        transactions: hourSales.length,
      });
    }
  }

  // Worker breakdown
  const workerMap: Record<string, { name: string; sales: number; revenue: number }> =
    {};
  completedSales.forEach((sale: any) => {
    const wId = sale.workerId;
    const wName = sale.worker?.fullName || "Unknown";
    if (!workerMap[wId]) {
      workerMap[wId] = { name: wName, sales: 0, revenue: 0 };
    }
    workerMap[wId].sales += 1;
    workerMap[wId].revenue += sale.totalAmount;
  });
  const workerStats = Object.values(workerMap).sort(
    (a, b) => b.revenue - a.revenue,
  );

  const formatPaymentMethod = (method: string) => {
    const labels: Record<string, string> = {
      CASH: "Cash",
      MOBILE_MONEY: "Mobile Money",
      CARD: "Card",
      TOKEN: "Token",
      BANK_TRANSFER: "Bank Transfer",
      UNKNOWN: "Other",
    };
    return labels[method] || method;
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Date Selector & Header */}
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Daily Closing Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {storeName} &mdash;{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="pl-10 pr-3 py-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {!isToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(new Date().toISOString().split("T")[0])
                  }
                >
                  Today
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSalesCSV(completedSales, `daily-sales_${selectedDate}`)}
                disabled={completedSales.length === 0}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadSalesReportPDF({
                    storeName,
                    period: selectedDate,
                    sales: completedSales,
                  })
                }
                disabled={completedSales.length === 0}
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Gross Revenue</span>
            </div>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {completedSales.length} completed sale{completedSales.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Net Revenue</span>
            </div>
            <p className="text-2xl font-bold">${netRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              After ${refundTotal.toFixed(2)} refunds
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Avg. Ticket</span>
            </div>
            <p className="text-2xl font-bold">${avgTicket.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              ${totalDiscount.toFixed(2)} in discounts
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Refunds</span>
            </div>
            <p className="text-2xl font-bold">{refundedSales.length}</p>
            <p className="text-xs text-muted-foreground">
              ${refundTotal.toFixed(2)} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Chart */}
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Hourly Sales Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "sales"
                          ? `$${Number(value).toFixed(2)}`
                          : `${value} txn`,
                        name === "sales" ? "Revenue" : "Transactions",
                      ]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="sales"
                      fill={CHART_COLORS.primary}
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="transactions"
                      fill={CHART_COLORS.muted}
                      opacity={0.5}
                      radius={[2, 2, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-muted-foreground">
                No sales data for this date
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(paymentBreakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(paymentBreakdown)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .map(([method, data]) => {
                    const pct =
                      totalRevenue > 0
                        ? ((data.amount / totalRevenue) * 100).toFixed(1)
                        : "0";
                    return (
                      <div key={method}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">
                            {formatPaymentMethod(method)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.count} txn &middot; ${data.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pct}% of revenue
                        </p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No payment data for this date
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.qty} sold
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">
                      ${product.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No product data for this date
              </div>
            )}
          </CardContent>
        </Card>

        {/* Worker Performance */}
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Worker Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {workerStats.length > 0 ? (
              <div className="space-y-3">
                {workerStats.map((worker, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{worker.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {worker.sales} sale{worker.sales !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ${worker.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No worker data for this date
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open/Pending Sales Warning */}
      {openSales.length > 0 && (
        <Card className="border border-yellow-400/60 dark:border-yellow-500/70 bg-yellow-50/50 dark:bg-yellow-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <Receipt className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {openSales.length} Open Sale{openSales.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  There {openSales.length === 1 ? "is" : "are"} {openSales.length}{" "}
                  uncompleted sale{openSales.length !== 1 ? "s" : ""} for this date.
                  These are not included in the revenue totals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
