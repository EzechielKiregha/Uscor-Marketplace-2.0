"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2,
  MessageSquare,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import ChatModal from "@/components/chat/ChatModal";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  GET_WORKER_BUSINESS_ORDERS,
  UPDATE_BUSINESS_ORDER_STATUS,
} from "@/graphql/order.gql";
import { useMe } from "@/lib/useMe";

interface WorkerOrdersPageProps {
  businessId: string;
}

export default function WorkerOrdersPage({ businessId }: WorkerOrdersPageProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [updatingGroupId, setUpdatingGroupId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_WORKER_BUSINESS_ORDERS, {
    variables: {
      businessId,
      status: statusFilter || undefined,
    },
    skip: !businessId,
  });

  const [updateOrderStatus] = useMutation(UPDATE_BUSINESS_ORDER_STATUS, {
    onCompleted: () => {
      showToast("success", "Status Updated", "Order status has been updated successfully");
      refetch();
      setUpdatingGroupId(null);
    },
    onError: (err) => {
      showToast("error", "Error", err.message || "Failed to update order status");
      setUpdatingGroupId(null);
    },
  });

  const handleStatusUpdate = async (businessGroupId: string, status: string) => {
    setUpdatingGroupId(businessGroupId);
    await updateOrderStatus({
      variables: {
        input: { businessGroupId, status },
      },
    });
  };

  const handleChatWithAdmin = (orderId: string) => {
    // The ORDER chat was auto-created on order creation
    // We need to find the chat ID for this order — for now open ChatModal
    // The worker can find the ORDER chat in their chat list
    setActiveChatId(null); // Opens chat list, worker finds the ORDER chat
    setChatModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      READY_FOR_SHIPMENT: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      PENDING: "Pending",
      PROCESSING: "Processing",
      READY_FOR_SHIPMENT: "Ready for Shipment",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getActionButtons = (order: any) => {
    // Find the business group for this business
    const group = order.businessGroups?.find((g: any) => g.businessId === businessId);
    if (!group) return null;

    const groupStatus = group.status || order.status || "PENDING";
    const isUpdating = updatingGroupId === group.id;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {groupStatus === "PENDING" && (
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
            onClick={() => handleStatusUpdate(group.id, "PROCESSING")}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Package className="h-3 w-3 mr-1" />}
            Start Processing
          </Button>
        )}

        {groupStatus === "PROCESSING" && (
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/30"
            onClick={() => handleStatusUpdate(group.id, "READY_FOR_SHIPMENT")}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Truck className="h-3 w-3 mr-1" />}
            Ready for Shipment
          </Button>
        )}

        {groupStatus === "READY_FOR_SHIPMENT" && (
          <>
            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Awaiting USCOR Pickup
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-primary border-primary/30 hover:bg-primary/10"
              onClick={() => handleChatWithAdmin(order.id)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat with Admin
            </Button>
          </>
        )}

        {(groupStatus === "SHIPPED" || groupStatus === "DELIVERED" || groupStatus === "COMPLETED") && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {groupStatus === "SHIPPED" ? "In Transit" : groupStatus === "DELIVERED" ? "Delivered" : "Completed"}
          </span>
        )}

        {groupStatus === "CANCELLED" && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        )}

        {(groupStatus === "PENDING" || groupStatus === "PROCESSING") && (
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => handleStatusUpdate(group.id, "CANCELLED")}
            disabled={isUpdating}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    );
  };

  if (loading) return <TableSkeleton />;
  if (error) return <div className="text-destructive">Error loading orders: {error.message}</div>;

  const orders = data?.businessOrders?.items || [];

  // Filter by search term
  const filteredOrders = orders.filter((order: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(term) ||
      order.client?.fullName?.toLowerCase().includes(term) ||
      order.client?.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-page-title">Order Management</h1>
          <p className="text-page-subtitle">
            Process orders, prepare for shipment, and coordinate with USCOR for delivery
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <select
            title="Status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 p-2 border border-border hover:border-primary hover:bg-primary/5 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_FOR_SHIPMENT">Ready for Shipment</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={emptyStateIcons.orders}
          title={searchTerm || statusFilter ? "No matching orders" : "No orders yet"}
          description={
            searchTerm || statusFilter
              ? "Try adjusting your search or filters"
              : "Orders from marketplace purchases will appear here for processing"
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: any) => {
            const group = order.businessGroups?.find((g: any) => g.businessId === businessId);
            const groupStatus = group?.status || order.status || "PENDING";
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
              >
                {/* Order header */}
                <div
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">#{order.id.substring(0, 8).toUpperCase()}</span>
                        {getStatusBadge(groupStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.client?.fullName} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        ${group?.total?.toFixed(2) || order.payment?.amount?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.products?.length || group?.items?.length || 0} items
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Customer info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Customer</p>
                        <p className="font-medium">{order.client?.fullName}</p>
                        <p className="text-sm text-muted-foreground">{order.client?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Payment</p>
                        <p className="font-medium">{order.payment?.method || "—"}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.payment?.status || "Pending"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Delivery Fee</p>
                        <p className="font-medium">${group?.deliveryFee?.toFixed(2) || "5.00"}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Order Items</p>
                      <div className="space-y-2">
                        {(group?.items || order.products || []).map((item: any) => {
                          const product = item.product;
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                            >
                              <img
                                src={
                                  product?.medias?.[0]?.url ||
                                  `https://placehold.co/60x60/EA580C/FFFFFF?text=${encodeURIComponent(product?.title?.charAt(0) || "P")}`
                                }
                                alt={product?.title}
                                className="w-10 h-10 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = `https://placehold.co/60x60/EA580C/FFFFFF?text=P`;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product?.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} × ${(item.price || product?.price || 0).toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm font-medium">
                                ${((item.price || product?.price || 0) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-2 border-t border-border">
                      {getActionButtons(order)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        chatId={activeChatId || undefined}
      />
    </div>
  );
}
