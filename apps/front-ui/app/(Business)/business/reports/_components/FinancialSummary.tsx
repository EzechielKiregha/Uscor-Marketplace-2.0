// app/business/reports/_components/FinancialSummary.tsx
"use client";

import { useQuery } from "@apollo/client";
import {
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    FileText,
    Percent,
    TrendingUp
} from "lucide-react";
import { useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_SALES_DASHBOARD } from "@/graphql/sales.gql";
import { GET_STORE_REPORTS } from "@/graphql/store.gql";
import { CHART_COLORS } from "@/lib/chart-theme";
import { downloadSalesReportPDF } from "@/lib/pdf/sales-report-pdf";

interface FinancialSummaryProps {
  storeId: string;
  storeName: string;
}

export default function FinancialSummary({
  storeId,
  storeName,
}: FinancialSummaryProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const { data: dashboardData, loading: dashLoading } = useQuery(
    GET_SALES_DASHBOARD,
    {
      variables: { storeId, period },
      skip: !storeId,
    },
  );

  const { data: reportsData, loading: reportsLoading } = useQuery(
    GET_STORE_REPORTS,
    {
      variables: { storeId, period },
      skip: !storeId,
    },
  );

  const loading = dashLoading || reportsLoading;

  if (loading) {
    return (
      <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading financial data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dashboard = dashboardData?.salesDashboard;
  const reports = reportsData?.storeReports;
  const chartData = dashboard?.chartData || [];
  const dailySales = reports?.dailySales || [];
  const paymentMethods = dashboard?.paymentMethods || [];

  const totalRevenue = dashboard?.totalRevenue || 0;
  const totalSales = dashboard?.totalSales || 0;
  const avgTicket = dashboard?.averageTicket || 0;

  // Calculate revenue trend from chart data
  const revenueData = chartData.length > 0
    ? chartData.map((d: any) => ({
        name: d.name,
        revenue: d.sales || 0,
        transactions: d.transactions || 0,
      }))
    : dailySales.map((d: any) => ({
        name: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: d.sales || 0,
        transactions: d.orders || 0,
      }));

  // Calculate growth (compare first half to second half of period)
  const midpoint = Math.floor(revenueData.length / 2);
  const firstHalf = revenueData
    .slice(0, midpoint)
    .reduce((sum: number, d: any) => sum + d.revenue, 0);
  const secondHalf = revenueData
    .slice(midpoint)
    .reduce((sum: number, d: any) => sum + d.revenue, 0);
  const growthPct =
    firstHalf > 0
      ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1)
      : "0";
  const isGrowing = Number(growthPct) >= 0;

  // Payment method totals
  const totalPaymentAmount = paymentMethods.reduce(
    (sum: number, pm: any) => sum + (pm.amount || 0),
    0,
  );

  const formatPaymentMethod = (method: string) => {
    const labels: Record<string, string> = {
      CASH: "Cash",
      MOBILE_MONEY: "Mobile Money",
      CARD: "Card",
      TOKEN: "Token",
      BANK_TRANSFER: "Bank Transfer",
    };
    return labels[method] || method;
  };

  const periodLabel =
    period === "day"
      ? "Today"
      : period === "week"
        ? "This Week"
        : "This Month";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Financial Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {storeName} &mdash; {periodLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(["day", "week", "month"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p === "day" ? "Today" : p === "week" ? "Week" : "Month"}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadSalesReportPDF({
                    storeName,
                    period: periodLabel,
                    sales: [],
                    paymentBreakdown: paymentMethods,
                    topProducts: dashboard?.topProducts,
                  })
                }
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-1">
              {isGrowing ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-xs ${isGrowing ? "text-green-600" : "text-red-600"}`}
              >
                {growthPct}% vs prev period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Transactions</span>
            </div>
            <p className="text-2xl font-bold">{totalSales}</p>
            <p className="text-xs text-muted-foreground">
              {period === "day"
                ? "today"
                : period === "week"
                  ? "this week"
                  : "this month"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Avg. Ticket</span>
            </div>
            <p className="text-2xl font-bold">${avgTicket.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">per transaction</p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Daily Avg</span>
            </div>
            <p className="text-2xl font-bold">
              $
              {revenueData.length > 0
                ? (
                    totalRevenue /
                    (period === "day" ? 1 : period === "week" ? 7 : 30)
                  ).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-xs text-muted-foreground">average daily revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS.primary}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "revenue"
                        ? `$${Number(value).toFixed(2)}`
                        : `${value}`,
                      name === "revenue" ? "Revenue" : "Transactions",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#revGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Summary */}
      <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Revenue by Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods
                .slice()
                .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
                .map((pm: any) => {
                  const pct =
                    totalPaymentAmount > 0
                      ? ((pm.amount / totalPaymentAmount) * 100).toFixed(1)
                      : "0";
                  return (
                    <div
                      key={pm.method}
                      className="p-4 rounded-lg border border-border"
                    >
                      <p className="text-sm font-medium mb-1">
                        {formatPaymentMethod(pm.method)}
                      </p>
                      <p className="text-xl font-bold">
                        ${(pm.amount || 0).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {pm.count || 0} transactions
                        </span>
                        <span className="text-xs font-medium text-primary">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No payment data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products Revenue */}
      {dashboard?.topProducts && dashboard.topProducts.length > 0 && (
        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Top Revenue Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.topProducts.slice(0, 8).map((product: any, idx: number) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {product.title}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.quantitySold} sold
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
