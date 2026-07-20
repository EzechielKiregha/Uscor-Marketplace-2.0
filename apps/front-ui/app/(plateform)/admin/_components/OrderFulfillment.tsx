"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import ChatModal from "@/components/chat/ChatModal";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  GET_ORDERS,
  UPDATE_BUSINESS_ORDER_STATUS,
} from "@/graphql/order.gql";

export default function OrderFulfillment() {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("READY_FOR_SHIPMENT");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [updatingGroupId, setUpdatingGroupId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ORDERS, {
    variables: {
      status: statusFilter || undefined,
      page: 1,
      limit: 50,
    },
  });

  const [updateOrderStatus] = useMutation(UPDATE_BUSINESS_ORDER_STATUS, {
    onCompleted: () => {
      showToast("success", "Status Updated", "Order status updated successfully");
      refetch();
      setUpdatingGroupId(null);
    },
    onError: (err) => {
      showToast("error", "Error", err.message || "Failed to update status");
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

  const handleOpenChat = (orderId: string) => {
    // Open ChatModal — admin can find the ORDER chat in the list
    setActiveChatId(null);
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

  if (loading) return <TableSkeleton />;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;

  const orders = data?.orders?.items || [];
  const filteredOrders = orders.filter((order: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(term) ||
      order.client?.fullName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border hover:border-primary bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["READY_FOR_SHIPMENT", "SHIPPED", "DELIVERED", "PROCESSING", ""].map((status) => (
            <Button
              key={status || "all"}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "" ? "All" : status === "READY_FOR_SHIPMENT" ? "Ready for Pickup" : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {orders.filter((o: any) => o.status === "READY_FOR_SHIPMENT" || o.businessGroups?.some((g: any) => g.status === "READY_FOR_SHIPMENT")).length}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500">Awaiting Pickup</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            {orders.filter((o: any) => o.status === "SHIPPED").length}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-500">In Transit</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {orders.filter((o: any) => o.status === "DELIVERED" || o.status === "COMPLETED").length}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500">Delivered</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {orders.length}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-500">Total Orders</p>
        </div>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={emptyStateIcons.orders}
          title={searchTerm || statusFilter ? "No matching orders" : "No orders"}
          description="Orders will appear here when businesses mark them ready for shipment."
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: any) => {
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">#{order.id.substring(0, 8).toUpperCase()}</span>
                        {getStatusBadge(order.status || "PENDING")}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.client?.fullName} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${order.payment?.amount?.toFixed(2) || "0.00"}</p>
                      <p className="text-xs text-muted-foreground">{order.products?.length || 0} items</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Customer + Payment info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Customer</p>
                        <p className="font-medium">{order.client?.fullName}</p>
                        <p className="text-sm text-muted-foreground">{order.client?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Payment</p>
                        <p className="font-medium">{order.payment?.method || "—"}</p>
                        <p className="text-sm text-muted-foreground">{order.payment?.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Delivery Fee</p>
                        <p className="font-medium">${order.deliveryFee?.toFixed(2) || "0.00"}</p>
                      </div>
                    </div>

                    {/* Business Groups */}
                    {order.businessGroups?.map((group: any) => (
                      <div key={group.id} className="border border-border rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {group.business?.avatar ? (
                              <img src={group.business.avatar} alt={group.business.name} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                                {group.business?.name?.charAt(0) || "B"}
                              </div>
                            )}
                            <span className="font-medium text-sm">{group.business?.name || "Business"}</span>
                            {getStatusBadge(group.status || "PENDING")}
                          </div>
                          <span className="font-semibold text-sm">${group.total?.toFixed(2)}</span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1">
                          {group.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-sm bg-muted/30 rounded px-2 py-1">
                              <span className="truncate flex-1">{item.product?.title}</span>
                              <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                              <span className="ml-2 font-medium">${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Admin actions per group */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
                          {group.status === "READY_FOR_SHIPMENT" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => handleStatusUpdate(group.id, "SHIPPED")}
                                disabled={updatingGroupId === group.id}
                              >
                                {updatingGroupId === group.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Truck className="h-3 w-3 mr-1" />}
                                Mark Shipped
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenChat(order.id)}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat with Worker
                              </Button>
                            </>
                          )}

                          {group.status === "SHIPPED" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleStatusUpdate(group.id, "DELIVERED")}
                              disabled={updatingGroupId === group.id}
                            >
                              {updatingGroupId === group.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                              Mark Delivered
                            </Button>
                          )}

                          {group.status === "DELIVERED" && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Delivered
                            </span>
                          )}

                          {group.status === "COMPLETED" && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
