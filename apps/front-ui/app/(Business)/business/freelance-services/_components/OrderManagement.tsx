// app/business/freelance-services/_components/OrderManagement.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@apollo/client';
import {
  UPDATE_FREELANCE_ORDER,
  COMPLETE_FREELANCE_ORDER
} from '@/graphql/freelance.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  BriefcaseBusiness,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderManagementProps {
  serviceId: string;
  serviceOrders: any[];
  loading: boolean;
}

export default function OrderManagement({
  serviceId,
  serviceOrders,
  loading
}: OrderManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const { showToast } = useToast();

  const [updateOrder] = useMutation(UPDATE_FREELANCE_ORDER);
  const [completeOrder] = useMutation(COMPLETE_FREELANCE_ORDER);

  const filteredOrders = useMemo(() => {
    if (!serviceOrders) return [];

    return serviceOrders.filter(order =>
      (order.client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.includes(searchQuery)) &&
      (!statusFilter || order.status === statusFilter)
    );
  }, [serviceOrders, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Confirmed</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrder({ variables: { id: orderId } });
      showToast('success', 'Success', 'Order marked as completed');
      setSelectedOrder(null);
    } catch (error) {
      showToast('error', 'Error', 'Failed to complete order');
    }
  };

  const handleUpdateOrder = async (orderId: string, status: string) => {
    try {
      await updateOrder({
        variables: {
          id: orderId,
          input: { status }
        }
      });
      showToast('success', 'Success', 'Order status updated');
    } catch (error) {
      showToast('error', 'Error', 'Failed to update order status');
    }
  };

  if (loading) return (
    <Card>
      <CardContent className="h-[500px] flex items-center justify-center">
        <Loader loading={true} />
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg">Service Orders</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage orders for your freelance services
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || statusFilter
              ? 'No matching orders found'
              : 'No orders for this service yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Order ID</th>
                  <th className="py-3 font-medium">Customer</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Quantity</th>
                  <th className="py-3 font-medium">Amount</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3">{order.id.substring(0, 8)}...</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                          {order.client.fullName.charAt(0)}
                        </div>
                        <span>{order.client.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">{order.quantity}</td>
                    <td className="py-3">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3">{getStatusBadge(order.status)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          View Details
                        </Button>
                        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">#{selectedOrder.id.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedOrder.status)}
                  <p className="text-sm font-medium mt-1">${selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </h3>
                  <p>{selectedOrder.client.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.client.email}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Service
                  </h3>
                  <p>{selectedOrder.service.title}</p>
                  <p className="text-sm text-muted-foreground">
                    ${selectedOrder.service.rate} {selectedOrder.service.isHourly ? '/hr' : 'fixed'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>
                      ${selectedOrder.service.rate} {selectedOrder.service.isHourly ? '/hr' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(selectedOrder.service.rate * selectedOrder.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {selectedOrder.status === 'CONFIRMED' && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
                      <div>
                        <p className="font-medium">Service Confirmed</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'IN_PROGRESS' && (
                    <>
                      <div className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
                        <div>
                          <p className="font-medium">Service Confirmed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
                        <div>
                          <p className="font-medium">Service Started</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedOrder.status === 'COMPLETED' && (
                    <>
                      <div className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
                        <div>
                          <p className="font-medium">Service Confirmed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
                        <div>
                          <p className="font-medium">Service Started</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-success mt-2 mr-3" />
                        <div>
                          <p className="font-medium">Service Completed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.escrowReleasedAt || selectedOrder.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setShowOrderModal(false)}>
                  Close
                </Button>
                {selectedOrder.status !== 'COMPLETED' && (
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    onClick={() => handleCompleteOrder(selectedOrder.id)}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}