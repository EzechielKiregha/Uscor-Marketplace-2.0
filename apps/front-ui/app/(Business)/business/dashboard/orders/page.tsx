// app/business/orders/page.tsx
"use client";

import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Button } from "@/components/ui/button";
import { GET_BUSINESS_ORDERS } from "@/graphql/order.gql";
import { OrderEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { useQuery } from "@apollo/client";
import { Search } from "lucide-react";
import { useState } from "react";
import { useOpenOrderDetailsModal } from "../../_hooks/use-open-order-details-modal";
import OrderDetailsModal from "./_components/OrderDetailsModal";

export default function BusinessOrdersPage() {
  const { isOpen, setIsOpen } = useOpenOrderDetailsModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const user = useMe();

  const { data, loading, error, refetch } = useQuery(GET_BUSINESS_ORDERS, {
    variables: {
      businessId: user?.id,
      search: searchTerm,
      status: statusFilter || undefined,
      date: dateFilter || undefined,
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Completed
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            Shipped
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) return <TableSkeleton />;
  if (error) return <div>Error loading orders</div>;

  return (
    <div className="space-y-6">
      {/* Info banner — order processing delegated to workers */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
        <Search className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-300">Order processing is handled by your workers</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Workers can process orders, mark them ready for shipment, and coordinate pickup with USCOR.
            View your <a href="/business/settlements" className="underline font-medium">settlements</a> for payment status.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-page-title">Orders</h1>
          <p className="text-page-subtitle">View customer orders (read-only)</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border hover:border-primary  bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <select
            title="all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 p-2 border hover:border-primary  rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PENDING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            title="all"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-48 p-2 border hover:border-primary  rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Dates</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_YEAR">This Year</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-3 font-medium">Order ID</th>
              <th className="py-3 font-medium">Customer</th>
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">Amount</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Items</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.businessOrders.items.map((order: OrderEntity) => (
              <tr
                key={order.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <td className="py-3">{order.id.substring(0, 8)}...</td>
                <td className="py-3">{order.client.email}</td>
                <td className="py-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">${order.payment?.amount.toFixed(2)}</td>
                <td className="py-3">
                  {getStatusBadge(order.payment?.status ?? "Undefined")}
                </td>
                <td className="py-3">{order.products?.length}</td>
                <td className="py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setIsOpen({
                        openOrderDetailsModal: true,
                        orderId: order.id,
                      })
                    }
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.businessOrders.items.length === 0 && (
        <EmptyState
          icon={emptyStateIcons.orders}
          title="No orders yet"
          description="Orders from your marketplace will appear here"
        />
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal />
    </div>
  );
}
