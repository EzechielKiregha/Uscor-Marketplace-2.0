"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  ArrowRightLeft,
  CheckCircle,
  Clock,
  Package,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  END_SHIFT,
  GET_WORKER_CURRENT_SHIFT,
  GET_WORKER_SHIFTS,
  START_SHIFT,
} from "@/graphql/worker.gql";
import {
  ADD_SALE_PRODUCT,
  COMPLETE_SALE,
  GET_SALE_BY_ID,
  REMOVE_SALE_PRODUCT,
  UPDATE_SALE_PRODUCT,
} from "@/graphql/sales.gql";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useMe } from "@/lib/useMe";
import { startOfDay, subDays } from "date-fns";
import { intervalToDuration } from "date-fns";
import ShiftSummary from "./ShiftSummary";
import { GET_SALES_HISTORY } from "@/graphql/sales.gql";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";

function useShiftDuration(startTime?: string) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  return intervalToDuration({
    start: new Date(startTime),
    end: new Date(now),
  });
}

interface ShiftsPageProps {
  selectedStoreId: string | null;
  viewMode?: "worker" | "business"; // New prop
  workerId?: string;
}

export default function ShiftsPage({
  selectedStoreId,
  viewMode = "worker",
  workerId,
}: ShiftsPageProps) {
  const { user } = useMe();
  const { isOnline, saveOfflineOperation, handleSync } = useIndexedDB();

  const [currentShift, setCurrentShift] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">(
    "week",
  );
  const [showShiftSummary, setShowShiftSummary] = useState(false);
  const [endedShiftData, setEndedShiftData] = useState<any>(null);
  const { showToast } = useToast();
  const effectiveWorkerId =
    viewMode === "business" && workerId ? workerId : user?.id;

  const {
    data: currentShiftData,
    loading: currentShiftLoading,
    refetch: refetchCurrentShift,
  } = useQuery(GET_WORKER_CURRENT_SHIFT, {
    variables: {
      workerId: effectiveWorkerId,
      storeId: selectedStoreId,
    },
    skip: !effectiveWorkerId,
  });

  const startDate = useMemo(() => {
    const now = new Date();

    if (timeRange === "today") {
      return startOfDay(now).toISOString();
    }

    if (timeRange === "week") {
      return subDays(now, 7).toISOString();
    }

    return subDays(now, 30).toISOString();
  }, [timeRange]);

  const {
    data: shiftsData,
    loading: shiftsLoading,
    refetch: refetchShifts,
  } = useQuery(GET_WORKER_SHIFTS, {
    variables: {
      workerId: effectiveWorkerId,
      storeId: selectedStoreId,
      startDate,
    },
    skip: !effectiveWorkerId,
  });

  const [startShift] = useMutation(START_SHIFT);
  const [endShift] = useMutation(END_SHIFT);
  const [addSaleProduct] = useMutation(ADD_SALE_PRODUCT);
  const [updateSaleProduct] = useMutation(UPDATE_SALE_PRODUCT);
  const [removeSaleProduct] = useMutation(REMOVE_SALE_PRODUCT);
  const [completeSale] = useMutation(COMPLETE_SALE);

  // Fetch shift sales for summary
  const { data: shiftSalesData } = useQuery(GET_SALES_HISTORY, {
    variables: {
      storeId: selectedStoreId,
      status: "COMPLETED",
      workerId: effectiveWorkerId,
      startDate: currentShift?.startTime,
    },
    skip: !currentShift?.startTime || !selectedStoreId || !showShiftSummary,
  });

  useEffect(() => {
    if (currentShiftData?.workerCurrentShift) {
      setCurrentShift(currentShiftData.workerCurrentShift);
    }
  }, [currentShiftData]);

  // console.log("current shift: ", {
  //   currentShiftData,
  //   currentShift,
  // });

  const handleStartShift = async () => {
    if (!isOnline) {
      // Handle offline shift start
      const offlineShift = {
        id: `offline_${Date.now()}`,
        workerId: effectiveWorkerId,
        storeId: selectedStoreId,
        startTime: new Date().toISOString(),
        status: "ACTIVE",
        sales: 0,
        transactions: 0,
        // status: 'PENDING_SYNC'
      };

      await saveOfflineOperation({
        type: "START_SHIFT",
        shift: offlineShift,
      });

      setCurrentShift(offlineShift);
      showToast(
        "info",
        "Offline Mode",
        "Shift started. Will sync when online.",
      );
    } else {
      try {
        const { data } = await startShift({
          variables: {
            input: {
              workerId: effectiveWorkerId,
              storeId: selectedStoreId,
              startTime: new Date().toISOString(),
            },
          },
        });

        setCurrentShift(data.startShift);
        showToast(
          "success",
          "Shift Started",
          "Your shift has been recorded successfully",
        );
        refetchCurrentShift();
      } catch (error: any) {
        showToast("error", "Error", error.message || "Failed to start shift");
      }
    }
  };

  const handleEndShift = async () => {
    if (!currentShift) return;

    // Save shift data for summary before clearing
    const shiftForSummary = {
      ...currentShift,
      endTime: new Date().toISOString(),
    };

    if (!isOnline) {
      // Handle offline shift end
      const updatedShift = {
        ...currentShift,
        endTime: new Date().toISOString(),
        status: "ENDED",
        sales: currentShift.sales || 0,
      };

      await saveOfflineOperation({
        type: "END_SHIFT",
        shift: updatedShift,
      });

      setEndedShiftData(shiftForSummary);
      setShowShiftSummary(true);
      setCurrentShift(null);
      showToast("info", "Offline Mode", "Shift ended. Will sync when online.");
    } else {
      try {
        const input = {
          id: currentShift.id,
          sales: currentShift.sales || 0,
        };
        const { data } = await endShift({
          variables: { input },
        });

        setEndedShiftData(shiftForSummary);
        setShowShiftSummary(true);
        setCurrentShift(null);
        showToast("success", "Shift Ended", "Your shift has been completed");
        refetchCurrentShift();
        refetchShifts();
      } catch (error: any) {
        showToast("error", "Error", error.message || "Failed to end shift");
      }
    }
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      handleSync({
        addSaleProduct,
        updateSaleProduct,
        removeSaleProduct,
        completeSale,
      });
    }
  }, [
    isOnline,
    handleSync,
    addSaleProduct,
    updateSaleProduct,
    removeSaleProduct,
    completeSale,
  ]);

  const duration = useShiftDuration(currentShift?.startTime);

  if (currentShiftLoading || shiftsLoading) return <DashboardSkeleton showChart={false} />;

  const shifts = shiftsData?.workerShifts?.items || [];
  const totalShifts = shiftsData?.workerShifts?.total || 0;

  // Calculate shift statistics
  const totalSales = shifts.reduce(
    (sum: number, shift: any) => sum + (shift.sales || 0),
    0,
  );
  const averageSales = shifts.length > 0 ? totalSales / shifts.length : 0;
  const totalHours = shifts.reduce((sum: number, shift: any) => {
    if (shift.startTime && shift.endTime) {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Hours
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">Shift Management</h1>
        <p className="text-muted-foreground">
          Track your work shifts and performance metrics
        </p>
      </div>

      {/* Current Shift Status */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
        <div className="p-4 bg-muted border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Current Shift Status</h2>
            <div className="flex gap-2">
              <Button
                variant={timeRange === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("today")}
              >
                Today
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
        </div>

        <div className="p-6">
          {currentShift ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Currently on Shift</h3>
              <p className="text-muted-foreground mb-4">
                Started at{" "}
                {new Date(currentShift.startTime).toLocaleTimeString()}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Sales Today
                    </span>
                  </div>
                  <p className="text-stat">
                    ${currentShift.sales?.toFixed(2) || "0.00"}
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Shift Duration{" "}
                      <span className="text-xs text-green-500">● Live</span>
                    </span>
                  </div>

                  <p className="text-stat tabular-nums">
                    {duration
                      ? `${duration.hours ?? 0}h ${duration.minutes ?? 0}m ${duration.seconds ?? 0}s`
                      : "0h 0m 0s"}
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Transactions
                    </span>
                  </div>
                  <p className="text-stat">
                    {currentShift.transactionCount}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleEndShift}
              >
                <Clock className="h-4 w-4 mr-2" />
                End Shift
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Active Shift</h3>
              <p className="text-muted-foreground mb-6">
                Click the button below to start your shift and begin tracking
                your work hours
              </p>

              <div className="flex flex-col items-center space-y-3">
                <Button variant="link" onClick={refetchCurrentShift}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  reload current shift
                </Button>
                <span className="text-italic text-gray-500">or</span>
                <Button variant="default" onClick={handleStartShift}>
                  <Clock className="h-4 w-4 mr-2" />
                  Start New Shift
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shift History */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
        <div className="p-4 bg-muted border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Shift History</h2>
            <Button variant="outline" size="icon">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          {shifts.length === 0 ? (
            <EmptyState
              icon={emptyStateIcons.shifts}
              title="No shift history available"
              description="Your shift records will appear here after you complete shifts"
              compact
            />
          ) : (
            <div className="space-y-3 max-h-100 overflow-y-auto">
              {shifts.map((shift: any) => (
                <div
                  key={shift.id}
                  className="border border-border rounded-lg p-3 hover:bg-muted/50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {new Date(shift.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(shift.startTime).toLocaleTimeString()} -{" "}
                        {shift.endTime
                          ? new Date(shift.endTime).toLocaleTimeString()
                          : "In Progress"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        ${shift.sales?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {shift.endTime ? "Completed" : "Active"}
                      </p>
                    </div>
                  </div>

                  {shift.endTime && (
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {Math.floor(
                            (new Date(shift.endTime).getTime() -
                              new Date(shift.startTime).getTime()) /
                              (1000 * 60 * 60),
                          )}
                          h
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>${shift.sales?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shift Analytics */}
      {shifts.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
          <div className="p-4 bg-muted border-b border-border">
            <h2 className="font-semibold">Shift Analytics</h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Total Shifts
                  </span>
                </div>
                <p className="text-stat">{totalShifts}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Total Sales
                  </span>
                </div>
                <p className="text-stat">${totalSales.toFixed(2)}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Avg. Sales
                  </span>
                </div>
                <p className="text-stat">${averageSales.toFixed(2)}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Total Hours
                  </span>
                </div>
                <p className="text-stat">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End-of-Shift Summary Modal */}
      {showShiftSummary && endedShiftData && (
        <ShiftSummary
          shift={endedShiftData}
          shiftSales={shiftSalesData?.salesHistory?.items || []}
          onClose={() => {
            setShowShiftSummary(false);
            setEndedShiftData(null);
          }}
        />
      )}
    </div>
  );
}
