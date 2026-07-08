"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GET_USERS } from "@/graphql/admin.gql";
import { REJECT_KYC, VERIFY_KYC } from "@/graphql/kyc.gql";

export default function BusinessManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const { data, loading, refetch } = useQuery(GET_USERS, {
    variables: {
      input: { search: search || undefined, page: 1, limit: 50 },
      includeBusinesses: true,
      includeClients: false,
      includeWorkers: false,
      includeAdmins: false,
    },
  });

  const [verifyKyc] = useMutation(VERIFY_KYC);
  const [rejectKyc] = useMutation(REJECT_KYC);

  const businesses = data?.all_businesses?.items || [];
  const filtered = statusFilter
    ? businesses.filter((b: any) => b.kycStatus === statusFilter)
    : businesses;

  const handleVerify = async (businessId: string) => {
    try {
      await verifyKyc({ variables: { businessId } });
      showToast("success", "Success", "Business verified");
      refetch();
    } catch (err: any) {
      showToast("error", "Error", err.message);
    }
  };

  const handleReject = async (businessId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await rejectKyc({ variables: { businessId, rejectionReason: reason } });
      showToast("success", "Success", "Business rejected");
      refetch();
    } catch (err: any) {
      showToast("error", "Error", err.message);
    }
  };

  if (loading) return <TableSkeleton />;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-section-title flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Business Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} businesses &middot; Verify, suspend, and manage
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={emptyStateIcons.reports}
              title="No businesses found"
              description="Try adjusting your search or filters"
              compact
            />
          </div>
        ) : (
          filtered.map((biz: any) => (
            <div key={biz.id} className="hover:bg-muted/30 transition-colors">
              {/* Summary row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === biz.id ? null : biz.id)
                }
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {biz.avatar ? (
                    <img
                      src={biz.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {biz.name?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{biz.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {biz.email}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-sm shrink-0">
                  <span className="capitalize text-muted-foreground">
                    {biz.businessType?.toLowerCase()}
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      biz.kycStatus === "VERIFIED"
                        ? "text-success"
                        : biz.kycStatus === "REJECTED"
                          ? "text-destructive"
                          : "text-warning"
                    }`}
                  >
                    {biz.kycStatus === "VERIFIED" && (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {biz.kycStatus === "REJECTED" && (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {biz.kycStatus}
                  </span>
                  {biz.isB2BEnabled && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      B2B
                    </span>
                  )}
                </div>

                {expandedId === biz.id ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </div>

              {/* Expanded details */}
              {expandedId === biz.id && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-stat-label">Workers</p>
                      <p className="text-lg font-bold">
                        {biz.totalWorkers || biz.workers?.length || 0}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-stat-label">Clients</p>
                      <p className="text-lg font-bold">
                        {biz.totalClients || 0}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-stat-label">Sales</p>
                      <p className="text-lg font-bold">{biz.totalSales || 0}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-stat-label">Revenue</p>
                      <p className="text-lg font-bold">
                        ${(biz.totalRevenueGenerated || 0).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />{" "}
                        {biz.address || "No address"}
                      </p>
                      <p className="text-muted-foreground">
                        Joined: {new Date(biz.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {biz.stores?.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1">
                          <Store className="h-3.5 w-3.5" /> Stores:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {biz.stores.map((s: any) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 text-xs rounded-full bg-muted border border-border"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Workers list */}
                  {biz.workers?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Workers:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {biz.workers.map((w: any) => (
                          <div
                            key={w.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm"
                          >
                            {w.avatar ? (
                              <img
                                src={w.avatar}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                {w.fullName?.charAt(0)}
                              </div>
                            )}
                            <span>{w.fullName}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {w.role?.toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {biz.kycStatus === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => handleVerify(biz.id)}
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" /> Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleReject(biz.id)}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {biz.kycStatus === "REJECTED" && (
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleVerify(biz.id)}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" /> Re-verify
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
