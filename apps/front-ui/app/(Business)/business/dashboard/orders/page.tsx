// app/business/orders/page.tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_BUSINESS_ORDERS } from '@/graphql/order.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { useState } from 'react';
import { useOpenOrderDetailsModal } from '../../_hooks/use-open-order-details-modal';
import OrderDetailsModal from './_components/OrderDetailsModal';
import { OrderEntity } from '@/lib/types';
import { useMe } from '@/lib/useMe';

export default function BusinessOrdersPage() {
  const { isOpen, setIsOpen } = useOpenOrderDetailsModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const user = useMe();

  const { data, loading, error, refetch } = useQuery(GET_BUSINESS_ORDERS, {
    variables: {
      businessId: user?.id,
      search: searchTerm,
      status: statusFilter || undefined,
      date: dateFilter || undefined
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Processing</span>;
      case 'SHIPPED':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Shipped</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">{status}</span>;
    }
  };

  if (loading) return (
    <Loader loading={true} />
  )
  if (error) return <div>Error loading orders</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <select
            title='all'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            title='all'
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-48 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3">{order.id.substring(0, 8)}...</td>
                <td className="py-3">{order.client.email}</td>
                <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-3">${order.payment?.amount.toFixed(2)}</td>
                <td className="py-3">{getStatusBadge(order.payment?.status ?? 'Undefined')}</td>
                <td className="py-3">{order.products?.length}</td>
                <td className="py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen({ openOrderDetailsModal: true, orderId: order.id })}
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
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground">You don't have any orders to display</p>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal />
    </div>
  );
}