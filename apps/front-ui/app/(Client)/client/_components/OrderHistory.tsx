// app/client/_components/OrderHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CLIENT_ORDERS } from '@/graphql/client-panel.gql';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Truck,
  Star,
  Loader2,
  ArrowRight,
  CheckCircle,
  X,
  MapPin
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Input } from '@/components/ui/input';

interface OrderHistoryProps {
  client: any;
}

export default function OrderHistory({ client }: OrderHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const { showToast } = useToast();

  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError
  } = useQuery(GET_CLIENT_ORDERS, {
    variables: {
      clientId: client.id,
      status: statusFilter || undefined
    }
  });

  const orders = ordersData?.clientOrders?.items || [];
  const totalOrders = ordersData?.clientOrders?.total || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'PROCESSING':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Processing</span>;
      case 'SHIPPED':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Shipped</span>;
      case 'DELIVERED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Delivered</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelled</span>;
      case 'REFUNDED':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Refunded</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  const getDeliveryStatus = (status: string) => {
    if (status === 'DELIVERED') {
      return { step: 3, label: 'Delivered' };
    } else if (status === 'SHIPPED') {
      return { step: 2, label: 'Shipped' };
    } else if (status === 'PROCESSING') {
      return { step: 1, label: 'Processing' };
    } else {
      return { step: 0, label: 'Order Placed' };
    }
  };

  const handleReorder = (order: any) => {
    // In a real app, this would create a new order with the same items
    showToast('success', 'Success', 'Items added to cart for reorder');

    // Navigate to cart
    setTimeout(() => {
      window.location.href = '/cart';
    }, 1000);
  };

  const handleReview = (order: any) => {
    // In a real app, this would open a review modal
    setActiveOrder(order);
    showToast('info', 'Review', 'You can leave a review for this order');
  };

  const filteredOrders = orders.filter((order: any) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some((item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (ordersLoading) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order history...</p>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Error Loading Orders</h3>
          <p className="text-muted-foreground mb-6">
            {ordersError.message}
          </p>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No orders found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter
              ? 'Try adjusting your search or filter criteria'
              : 'You haven\'t placed any orders yet'}
          </p>

          {(searchQuery || statusFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}

          {!searchQuery && !statusFilter && (
            <Button
              variant="default"
              className="mt-2"
              onClick={() => window.location.href = '/marketplace'}
            >
              Start Shopping
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">
            View your past orders and reorder your favorites
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
            className="w-full sm:w-48 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filteredOrders.map((order: any) => {
          const deliveryStatus = getDeliveryStatus(order.status);

          return (
            <div key={order.id} className="p-4 hover:bg-muted/50">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Order Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">Order #{order.orderNumber}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">${order.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className="flex items-center gap-2 mt-2">
                    {order.business.avatar ? (
                      <img
                        src={order.business.avatar}
                        alt={order.business.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                        {order.business.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">{order.business.name}</span>
                    {order.store && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span>{order.store.name}</span>
                      </>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {order.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 truncate">
                        {item.media && item.media.length > 0 ? (
                          <img
                            src={item.media[0].url}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-muted-foreground flex items-center">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Delivery Timeline */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Order Status</span>
                      <span className="text-sm font-medium">{deliveryStatus.label}</span>
                    </div>

                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute top-4 left-0 right-0 h-0.5 bg-border"></div>

                      {/* Timeline steps */}
                      <div className="relative flex justify-between">
                        <div className={`flex flex-col items-center ${deliveryStatus.step >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${deliveryStatus.step >= 0 ? 'bg-primary text-primary-foreground' : 'bg-border'
                            }`}>
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="text-xs text-center">Order<br />Placed</span>
                        </div>

                        <div className={`flex flex-col items-center ${deliveryStatus.step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${deliveryStatus.step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-border'
                            }`}>
                            <Truck className="h-4 w-4" />
                          </div>
                          <span className="text-xs text-center">Processing</span>
                        </div>

                        <div className={`flex flex-col items-center ${deliveryStatus.step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${deliveryStatus.step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-border'
                            }`}>
                            <Truck className="h-4 w-4" />
                          </div>
                          <span className="text-xs text-center">Shipped</span>
                        </div>

                        <div className={`flex flex-col items-center ${deliveryStatus.step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${deliveryStatus.step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-border'
                            }`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="text-xs text-center">Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-col gap-2 min-w-40">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveOrder(order)}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {order.status === 'DELIVERED' && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleReview(order)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Leave Review
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleReorder(order)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {activeOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order #{activeOrder.orderNumber}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveOrder(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Items */}
                  <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                    <div className="p-4 bg-muted border-b border-border">
                      <h3 className="font-semibold">Order Items</h3>
                    </div>

                    <div className="divide-y divide-border">
                      {activeOrder.items.map((item: any) => (
                        <div key={item.id} className="p-4 flex items-center gap-3">
                          {item.media && item.media.length > 0 ? (
                            <img
                              src={item.media[0].url}
                              alt={item.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Totals */}
                    <div className="p-4 bg-muted border-t border-border">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${activeOrder.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery:</span>
                          <span>$0.00</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-border">
                          <span>Total:</span>
                          <span>${activeOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Timeline */}
                  <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                    <div className="p-4 bg-muted border-b border-border">
                      <h3 className="font-semibold">Order Status</h3>
                    </div>

                    <div className="p-4">
                      {getStatusBadge(activeOrder.status)}

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Delivery Timeline</span>
                          <span className="text-sm font-medium">{getDeliveryStatus(activeOrder.status).label}</span>
                        </div>

                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border"></div>

                          {/* Timeline steps */}
                          <div className="relative flex justify-between">
                            <div className={`flex flex-col items-center ${getDeliveryStatus(activeOrder.status).step >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${getDeliveryStatus(activeOrder.status).step >= 0 ? 'bg-primary text-primary-foreground' : 'bg-border'
                                }`}>
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span className="text-xs text-center">Order<br />Placed</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {new Date(activeOrder.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className={`flex flex-col items-center ${getDeliveryStatus(activeOrder.status).step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${getDeliveryStatus(activeOrder.status).step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-border'
                                }`}>
                                <Truck className="h-4 w-4" />
                              </div>
                              <span className="text-xs text-center">Processing</span>
                              {activeOrder.status !== 'PENDING' && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {new Date(activeOrder.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <div className={`flex flex-col items-center ${getDeliveryStatus(activeOrder.status).step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${getDeliveryStatus(activeOrder.status).step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-border'
                                }`}>
                                <Truck className="h-4 w-4" />
                              </div>
                              <span className="text-xs text-center">Shipped</span>
                              {activeOrder.status === 'SHIPPED' && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {new Date(activeOrder.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <div className={`flex flex-col items-center ${getDeliveryStatus(activeOrder.status).step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${getDeliveryStatus(activeOrder.status).step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-border'
                                }`}>
                                <CheckCircle className="h-4 w-4" />
                              </div>
                              <span className="text-xs text-center">Delivered</span>
                              {activeOrder.status === 'DELIVERED' && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {new Date(activeOrder.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business & Payment Info */}
                <div className="space-y-6">
                  {/* Business Info */}
                  <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                    <div className="p-4 bg-muted border-b border-border">
                      <h3 className="font-semibold">Business Information</h3>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {activeOrder.business.avatar ? (
                          <img
                            src={activeOrder.business.avatar}
                            alt={activeOrder.business.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm">
                            {activeOrder.business.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{activeOrder.business.name}</h4>
                          {activeOrder.store && (
                            <p className="text-sm text-muted-foreground">{activeOrder.store.name}</p>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full justify-start mt-2"
                        onClick={() => {
                          setActiveOrder(null);
                          window.location.href = `/business/${activeOrder.business.id}`;
                        }}
                      >
                        View Business Profile
                      </Button>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                    <div className="p-4 bg-muted border-b border-border">
                      <h3 className="font-semibold">Payment Information</h3>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Payment Method</p>
                          <p className="text-sm text-muted-foreground">
                            {activeOrder.paymentMethod ? `${activeOrder.paymentMethod.type} •••• ${activeOrder.paymentMethod.last4}` : 'Mobile Money'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Note:</span> For mobile money payments,
                          the transaction is completed when you confirm the payment on your phone.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {activeOrder.deliveryAddress && (
                    <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                      <div className="p-4 bg-muted border-b border-border">
                        <h3 className="font-semibold">Delivery Address</h3>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                          <div>
                            <p>{activeOrder.deliveryAddress.street}</p>
                            <p>{activeOrder.deliveryAddress.city}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="space-y-2">
                    {activeOrder.status === 'DELIVERED' && (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleReview(activeOrder)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Leave a Review
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleReorder(activeOrder)}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Reorder Items
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalOrders > 10 && (
        <div className="p-4 bg-muted border-t border-border flex justify-between items-center">
          <Button variant="outline">Previous</Button>
          <span>Page 1 of {Math.ceil(totalOrders / 10)}</span>
          <Button variant="outline">Next</Button>
        </div>
      )}
    </div>
  );
}