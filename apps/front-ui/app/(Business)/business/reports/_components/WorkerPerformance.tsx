// app/business/reports/_components/WorkerPerformance.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_STORE_REPORTS, GET_STORE_SHIFTS } from "@/graphql/store.gql";
import { CHART_COLORS } from "@/lib/chart-theme";
import { exportShiftsCSV } from "@/lib/export-utils";
import { downloadShiftReportPDF } from "@/lib/pdf/shift-report-pdf";
import { useQuery } from "@apollo/client";
import {
  Award,
  Clock,
  DollarSign,
  Download,
  FileText,
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
} from "recharts";
import { NameType } from "recharts/types/component/DefaultTooltipContent";

interface WorkerPerformanceProps {
  storeId: string;
  storeName: string;
}

export default function WorkerPerformance({
  storeId,
  storeName,
}: WorkerPerformanceProps) {
  const [period, setPeriod] = useState<string>("week");

  const { data: reportsData, loading: reportsLoading } = useQuery(
    GET_STORE_REPORTS,
    {
      variables: { storeId, period },
      skip: !storeId,
    },
  );

  const { data: shiftsData, loading: shiftsLoading } = useQuery(
    GET_STORE_SHIFTS,
    {
      variables: { storeId },
      skip: !storeId,
    },
  );

  const loading = reportsLoading || shiftsLoading;

  if (loading) {
    return (
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading worker metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const workers = reportsData?.storeReports?.workerPerformance || [];
  const shifts = shiftsData?.storeShifts || [];

  // Calculate aggregated stats
  const totalWorkers = workers.length;
  const totalSalesAll = workers.reduce(
    (sum: number, w: any) => sum + (w.sales || 0),
    0,
  );
  const totalHoursAll = workers.reduce(
    (sum: number, w: any) => sum + (w.hoursWorked || 0),
    0,
  );
  const avgSalesPerWorker = totalWorkers > 0 ? totalSalesAll / totalWorkers : 0;
  const avgCompletionRate =
    totalWorkers > 0
      ? workers.reduce(
          (sum: number, w: any) => sum + (w.completionRate || 0),
          0,
        ) / totalWorkers
      : 0;

  // Build chart data from worker performance
  const chartData = workers.map((w: any) => ({
    name: w.workerName?.split(" ")[0] || "Worker",
    revenue: w.sales || 0,
    hours: w.hoursWorked || 0,
  }));

  // Active shifts
  const activeShifts = shifts.filter(
    (s: any) => s.status === "INPROGRESS" || (!s.endTime && s.startTime),
  );

  // Top performer
  const topPerformer =
    workers.length > 0
      ? workers.reduce((best: any, w: any) =>
          (w.sales || 0) > (best.sales || 0) ? w : best,
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Worker Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {storeName} &mdash;{" "}
                {period === "week"
                  ? "Past 7 Days"
                  : period === "month"
                    ? "Past 30 Days"
                    : period === "quarter"
                      ? "Past 90 Days"
                      : "Past Year"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(["week", "month", "quarter"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p === "week" ? "Week" : p === "month" ? "Month" : "Quarter"}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportShiftsCSV(shifts)}
                disabled={shifts.length === 0}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadShiftReportPDF({
                    storeName,
                    shifts,
                  })
                }
                disabled={shifts.length === 0}
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
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Active Workers
              </span>
            </div>
            <p className="text-2xl font-bold">{totalWorkers}</p>
            <p className="text-xs text-muted-foreground">
              {activeShifts.length} on shift now
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold">${totalSalesAll.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              Avg ${avgSalesPerWorker.toFixed(2)}/worker
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Hours</span>
            </div>
            <p className="text-2xl font-bold">{totalHoursAll.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">
              Avg{" "}
              {totalWorkers > 0
                ? (totalHoursAll / totalWorkers).toFixed(1)
                : "0"}
              h/worker
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">
                Avg Completion
              </span>
            </div>
            <p className="text-2xl font-bold">
              {avgCompletionRate.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              sale completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Per Worker Chart */}
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Revenue by Worker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: any, name: NameType | undefined) => [
                        name === "revenue"
                          ? `$${Number(value).toFixed(2)}`
                          : `${value}h`,
                        name === "revenue" ? "Revenue" : "Hours",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-muted-foreground">
                No worker data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Worker Rankings */}
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Worker Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workers.length > 0 ? (
              <div className="space-y-3">
                {workers
                  .slice()
                  .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
                  .map((worker: any, idx: number) => {
                    const isTop = idx === 0 && workers.length > 1;
                    return (
                      <div
                        key={worker.workerId}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isTop
                            ? "border-primary/30 bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isTop
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium flex items-center gap-1">
                              {worker.workerName}
                              {isTop && (
                                <Award className="h-3.5 w-3.5 text-primary" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {worker.hoursWorked?.toFixed(1) || 0}h worked
                              &middot; {worker.completionRate?.toFixed(0) || 0}%
                              rate
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            ${(worker.sales || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            $
                            {worker.hoursWorked
                              ? (worker.sales / worker.hoursWorked).toFixed(2)
                              : "0.00"}
                            /h
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No worker data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Shifts */}
      {activeShifts.length > 0 && (
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              Active Shifts ({activeShifts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeShifts.map((shift: any) => {
                const duration = shift.startTime
                  ? (
                      (Date.now() - new Date(shift.startTime).getTime()) /
                      3600000
                    ).toFixed(1)
                  : "0";
                return (
                  <div
                    key={shift.id}
                    className="p-3 rounded-lg border border-green-400/30 bg-green-50/50 dark:bg-green-900/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-sm font-medium">
                        {shift.worker?.fullName || "Worker"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Started{" "}
                      {new Date(shift.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      &middot; {duration}h &middot;{" "}
                      {shift.transactionCount || 0} txn
                    </p>
                    <p className="text-xs font-medium mt-1">
                      ${(shift.sales || 0).toFixed(2)} revenue
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
