"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Package,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GET_CLIENT_ORDERS } from "@/graphql/client-panel.gql";

interface PurchaseHistoryProps {
  client: any;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const DATE_RANGE_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 3 Months" },
  { value: "365", label: "Last Year" },
];

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };
  return colors[status] || colors.PENDING;
}

export default function PurchaseHistory({ client }: PurchaseHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, loading } = useQuery(GET_CLIENT_ORDERS, {
    variables: {
      clientId: client.id,
      status: statusFilter || undefined,
      page,
      limit: 15,
    },
  });

  const orders = data?.clientOrders?.items?.filter(
    (order: any) => !order?.clientOrderId,
  ) || [];
  const total = data?.clientOrders?.total || 0;
  const totalPages = Math.ceil(total / 15);

  // Client-side filtering (date range + search)
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Date range filter
    if (dateRange) {
      const daysAgo = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysAgo);
      result = result.filter(
        (o: any) => new Date(o.createdAt) >= cutoff,
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o: any) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.business?.name?.toLowerCase().includes(q) ||
          o.items?.some((item: any) =>
            item.name?.toLowerCase().includes(q),
          ),
      );
    }

    // Sorting
    result.sort((a: any, b: any) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "date") {
        return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return multiplier * (a.totalAmount - b.totalAmount);
    });

    return result;
  }, [orders, dateRange, searchQuery, sortBy, sortOrder]);

  // Summary stats
  const stats = useMemo(() => {
    const delivered = orders.filter((o: any) => o.status === "DELIVERED");
    const totalSpent = delivered.reduce(
      (sum: number, o: any) => sum + (o.totalAmount || 0),
      0,
    );
    return {
      totalOrders: total,
      delivered: delivered.length,
      totalSpent,
      avgOrder: delivered.length > 0 ? totalSpent / delivered.length : 0,
    };
  }, [orders, total]);

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: "date" | "amount" }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  if (loading) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-page-title">Purchase History</h1>
        <p className="text-muted-foreground text-sm">
          View and filter all your past purchases
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 card-hover">
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="text-stat">{stats.totalOrders}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 card-hover">
          <p className="text-xs text-muted-foreground">Delivered</p>
          <p className="text-stat text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 card-hover">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-stat text-primary">
            ${stats.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 card-hover">
          <p className="text-xs text-muted-foreground">Avg. Order</p>
          <p className="text-stat">${stats.avgOrder.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-3 space-y-3">
        {/* Search + Filter toggle */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search orders, businesses, or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(statusFilter || dateRange) && (
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {[statusFilter, dateRange].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="p-2 text-sm border border-border rounded-lg bg-background"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="p-2 text-sm border border-border rounded-lg bg-background"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {(statusFilter || dateRange) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("");
                  setDateRange("");
                  setPage(1);
                }}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-2 p-3 bg-muted text-xs font-medium text-muted-foreground border-b border-border">
          <div className="col-span-3">Order</div>
          <div className="col-span-3">Business</div>
          <div className="col-span-2">
            <button
              onClick={() => toggleSort("date")}
              className="flex items-center gap-1 hover:text-foreground"
            >
              Date <SortIcon field="date" />
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => toggleSort("amount")}
              className="flex items-center gap-1 hover:text-foreground"
            >
              Amount <SortIcon field="amount" />
            </button>
          </div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No purchases found</p>
            {(searchQuery || statusFilter || dateRange) && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setDateRange("");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
            {filteredOrders.map((order: any) => (
              <div key={order.id}>
                {/* Order Row */}
                <button
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.id ? null : order.id,
                    )
                  }
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 p-3 hover:bg-muted/50 transition-colors text-left items-center"
                >
                  <div className="md:col-span-3">
                    <p className="font-medium text-sm truncate">
                      #{order.orderNumber?.substring(0, 12) || order.id.substring(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="md:col-span-3 flex items-center gap-2">
                    {order.business?.avatar ? (
                      <img
                        src={order.business.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px]">
                        <Store className="h-3 w-3" />
                      </div>
                    )}
                    <span className="text-sm truncate">
                      {order.business?.name || "Unknown"}
                    </span>
                  </div>

                  <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>

                  <div className="md:col-span-2 text-sm font-bold">
                    ${order.totalAmount?.toFixed(2) || "0.00"}
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedOrderId === order.id && (
                  <div className="px-4 pb-4 bg-muted/30 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                      {/* Items */}
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                          Items
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2"
                            >
                              {item.media?.[0]?.url ? (
                                <img
                                  src={item.media[0].url}
                                  alt=""
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                  <Package className="h-3 w-3" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ${item.price?.toFixed(2)} x {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        {order.deliveryAddress && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">
                              Delivery Address
                            </h4>
                            <p className="text-sm">
                              {order.deliveryAddress.street},{" "}
                              {order.deliveryAddress.city}
                            </p>
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">
                              Payment
                            </h4>
                            <p className="text-sm">
                              {order.paymentMethod.type}
                              {order.paymentMethod.last4 &&
                                ` •••• ${order.paymentMethod.last4}`}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {order.receiptUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(order.receiptUrl, "_blank");
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
