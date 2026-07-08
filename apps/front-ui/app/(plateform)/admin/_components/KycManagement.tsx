"use client";

import { useQuery } from "@apollo/client";
import { CheckCircle, Clock, Eye, Search, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GET_KYC_SUBMISSIONS } from "@/graphql/admin.gql";

interface KycManagementProps {
  onKycSelected: (kyc: any) => void;
}

export default function KycManagement({ onKycSelected }: KycManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");

  const {
    data: kycData,
    loading: kycLoading,
    error: kycError,
    refetch,
  } = useQuery(GET_KYC_SUBMISSIONS, {
    variables: {
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      businessType: businessTypeFilter || undefined,
    },
  });

  const kycSubmissions = kycData?.kycSubmissions?.items || [];
  const totalSubmissions = kycData?.kycSubmissions?.total || 0;

  const filteredSubmissions = kycSubmissions.filter((submission: any) => {
    const matchesSearch =
      !searchQuery ||
      submission.business?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      submission.business?.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (submission.business?.taxId || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || submission.status === statusFilter;
    const matchesType =
      !businessTypeFilter ||
      submission.business?.businessType === businessTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  console.log({ filteredSubmissions });

  if (kycLoading) return <TableSkeleton />;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              KYC Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Verify business identities and enable marketplace features
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Types</option>
              <option value="ARTISAN">Artisan</option>
              <option value="BOOKSTORE">Bookstore</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="HARDWARE">Hardware</option>
              <option value="GROCERY">Grocery</option>
              <option value="CAFE">Café</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="RETAIL">Retail</option>
              <option value="BAR">Bar</option>
              <option value="CLOTHING">Clothing</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={emptyStateIcons.reports}
            title="No matching KYC submissions"
            description={
              searchQuery || statusFilter || businessTypeFilter
                ? "Try adjusting your search or filter criteria"
                : "Businesses will appear here once they submit KYC documents"
            }
            compact
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission: any) => (
                  <tr
                    key={submission.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {submission.business?.avatar ? (
                          <Image
                            src={submission.business?.avatar}
                            alt={submission.business?.name}
                            className="w-10 h-10 rounded-full object-cover"
                            width={100}
                            height={100}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                            {submission.business?.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">
                            {submission.business?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {submission.business?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm capitalize">
                        {submission.business?.businessType.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={submission.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Document
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {submission.status === "PENDING" && (
                        <span className="flex items-center gap-1 text-warning">
                          <Clock className="h-4 w-4" />
                          Pending
                        </span>
                      )}
                      {submission.status === "VERIFIED" && (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                      {submission.status === "REJECTED" && (
                        <span className="flex items-center gap-1 text-destructive">
                          <X className="h-4 w-4" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onKycSelected(submission)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
