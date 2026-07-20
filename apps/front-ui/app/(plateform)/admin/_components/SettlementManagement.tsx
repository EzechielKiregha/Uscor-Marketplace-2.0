"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Percent,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  BATCH_DISTRIBUTE_SETTLEMENTS,
  DISTRIBUTE_SETTLEMENT,
  GET_SETTLEMENT_STATS,
  GET_SETTLEMENTS,
} from "@/graphql/settlement.gql";
import { formatPrice } from "@/lib/utils";

export default function SettlementManagement() {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const {
    data: settlementsData,
    loading,
    refetch,
  } = useQuery(GET_SETTLEMENTS, {
    variables: { page, limit: 20, status: statusFilter },
    fetchPolicy: "cache-and-network",
  });

  const { data: statsData } = useQuery(GET_SETTLEMENT_STATS, {
    fetchPolicy: "cache-and-network",
  });

  const [distributeOne, { loading: distributing }] = useMutation(
    DISTRIBUTE_SETTLEMENT,
    {
      onCompleted: () => {
        showToast("success", "Distributed", "Settlement distributed to business");
        refetch();
      },
      onError: (err) =>
        showToast("error", "Failed", err.message),
    },
  );

  const [batchDistribute, { loading: batchDistributing }] = useMutation(
    BATCH_DISTRIBUTE_SETTLEMENTS,
    {
      onCompleted: (data) => {
        const count = data.batchDistributeSettlements?.length || 0;
        showToast(
          "success",
          "Batch Distributed",
          `${count} settlement(s) distributed`,
        );
        setSelectedIds(new Set());
        refetch();
      },
      onError: (err) =>
        showToast("error", "Failed", err.message),
    },
  );

  const settlements = settlementsData?.settlements?.items || [];
  const total = settlementsData?.settlements?.total || 0;
  const stats = statsData?.settlementStats;
  const totalPages = Math.ceil(total / 20);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingIds = settlements
      .filter((s: any) => s.status === "PENDING")
      .map((s: any) => s.id);
    if (pendingIds.every((id: string) => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingIds));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{formatPrice(stats.totalPending)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingCount} settlement(s)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distributed</p>
                <p className="text-xl font-bold">
                  {formatPrice(stats.totalDistributed)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.distributedCount} settlement(s)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
                <p className="text-xl font-bold">
                  {formatPrice(stats.totalPlatformFees)}
                </p>
                <p className="text-xs text-muted-foreground">Total earned</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Fees</p>
                <p className="text-xl font-bold">
                  {formatPrice(stats.totalDeliveryFees)}
                </p>
                <p className="text-xs text-muted-foreground">Total collected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            { label: "All", value: undefined },
            { label: "Pending", value: "PENDING" },
            { label: "Distributed", value: "DISTRIBUTED" },
          ].map((opt) => (
            <Button
              key={opt.label}
              variant={statusFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {selectedIds.size > 0 && (
          <Button
            size="sm"
            onClick={() =>
              batchDistribute({
                variables: { ids: Array.from(selectedIds) },
              })
            }
            disabled={batchDistributing}
          >
            {batchDistributing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4 mr-2" />
            )}
            Distribute {selectedIds.size} selected
          </Button>
        )}
      </div>

      {/* Settlements Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      settlements.filter((s: any) => s.status === "PENDING")
                        .length > 0 &&
                      settlements
                        .filter((s: any) => s.status === "PENDING")
                        .every((s: any) => selectedIds.has(s.id))
                    }
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Business
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Order
                </th>
                <th className="p-3 text-right font-medium text-muted-foreground">
                  Gross
                </th>
                <th className="p-3 text-right font-medium text-muted-foreground">
                  Fee
                </th>
                <th className="p-3 text-right font-medium text-muted-foreground">
                  Delivery
                </th>
                <th className="p-3 text-right font-medium text-muted-foreground">
                  Net
                </th>
                <th className="p-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="p-3 text-center font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !settlements.length ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading settlements...
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No settlements found
                  </td>
                </tr>
              ) : (
                settlements.map((s: any) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3">
                      {s.status === "PENDING" && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="h-4 w-4 rounded accent-primary cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                          {s.business?.avatar ? (
                            <img
                              src={s.business.avatar}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[140px]">
                          {s.business?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {s.orderId?.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="p-3 text-right">{formatPrice(s.grossAmount)}</td>
                    <td className="p-3 text-right text-primary">
                      {formatPrice(s.platformFee)}
                    </td>
                    <td className="p-3 text-right text-blue-500">
                      {formatPrice(s.deliveryFee)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatPrice(s.netAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "DISTRIBUTED"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : s.status === "FAILED"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {s.status === "DISTRIBUTED" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {s.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {s.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            distributeOne({ variables: { id: s.id } })
                          }
                          disabled={distributing}
                        >
                          Distribute
                        </Button>
                      )}
                      {s.status === "DISTRIBUTED" && (
                        <span className="text-xs text-muted-foreground">
                          {s.distributedAt
                            ? new Date(s.distributedAt).toLocaleDateString()
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
