"use client";

import { useQuery } from "@apollo/client";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Minus,
  Percent,
  Truck,
} from "lucide-react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import {
  GET_BUSINESS_SETTLEMENT_STATS,
  GET_BUSINESS_SETTLEMENTS,
} from "@/graphql/settlement.gql";
import { formatPrice } from "@/lib/utils";
import { useMe } from "@/lib/useMe";
import { useState } from "react";

export default function BusinessSettlementsPage() {
  const { user, role, loading: authLoading } = useMe();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const businessId = role === "business" ? user?.id : "";

  const { data: settlementsData, loading } = useQuery(
    GET_BUSINESS_SETTLEMENTS,
    {
      variables: { businessId, page, limit: 20, status: statusFilter },
      skip: !businessId,
      fetchPolicy: "cache-and-network",
    },
  );

  const { data: statsData } = useQuery(GET_BUSINESS_SETTLEMENT_STATS, {
    variables: { businessId },
    skip: !businessId,
    fetchPolicy: "cache-and-network",
  });

  if (authLoading) return <DashboardSkeleton statCount={4} showChart={false} showTable />;

  const settlements = settlementsData?.businessSettlements?.items || [];
  const total = settlementsData?.businessSettlements?.total || 0;
  const totalPages = Math.ceil(total / 20);
  const stats = statsData?.businessSettlementStats;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settlements</h1>
        <p className="text-muted-foreground">
          Track your payment settlements from USCOR
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">
                  {formatPrice(stats.totalPending)}
                </p>
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
                <p className="text-sm text-muted-foreground">Received</p>
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
                <p className="text-xs text-muted-foreground">Total deducted</p>
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
                <p className="text-xs text-muted-foreground">
                  Handled by USCOR
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: "All", value: undefined },
          { label: "Pending", value: "PENDING" },
          { label: "Received", value: "DISTRIBUTED" },
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

      {/* Settlements List */}
      <div className="space-y-3">
        {loading && !settlements.length ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : settlements.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <DollarSign className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No settlements yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Settlements are created when clients pay for orders
            </p>
          </div>
        ) : (
          settlements.map((s: any) => (
            <div
              key={s.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      s.status === "DISTRIBUTED"
                        ? "bg-green-500/10"
                        : "bg-amber-500/10"
                    }`}
                  >
                    {s.status === "DISTRIBUTED" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      Order #{s.orderId?.substring(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Gross</p>
                    <p className="font-medium">
                      {formatPrice(s.grossAmount)}
                    </p>
                  </div>
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Fee</p>
                    <p className="font-medium text-primary">
                      {formatPrice(s.platformFee)}
                    </p>
                  </div>
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Delivery</p>
                    <p className="font-medium text-blue-500">
                      {formatPrice(s.deliveryFee)}
                    </p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Net</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatPrice(s.netAmount)}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                    s.status === "DISTRIBUTED"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {s.status === "DISTRIBUTED" ? "Received" : "Pending"}
                </span>
              </div>

              {s.status === "DISTRIBUTED" && s.distributedAt && (
                <p className="text-xs text-muted-foreground mt-2 pl-11">
                  Distributed on{" "}
                  {new Date(s.distributedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
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
  );
}
