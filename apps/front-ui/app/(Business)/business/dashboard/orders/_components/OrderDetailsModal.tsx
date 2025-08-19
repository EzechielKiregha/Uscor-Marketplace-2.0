// app/business/orders/_components/OrderDetailsModal.tsx
"use client";

import { useQuery } from '@apollo/client';
import { GET_ORDER_BY_ID } from '@/graphql/order.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Package, Truck, CreditCard } from 'lucide-react';
import { useOpenOrderDetailsModal } from '../../../_hooks/use-open-order-details-modal';
import ResponsiveModal from '@/app/(Business)/business/_components/responsive-modal';
import { OrderEntity } from '@/lib/types';

export default function OrderDetailsModal() {
  const { isOpen, setIsOpen, orderId } = useOpenOrderDetailsModal();

  const { data, loading, error } = useQuery(GET_ORDER_BY_ID, {
    variables: { id: orderId },
    skip: !orderId
  });

  const handleClose = () => {
    setIsOpen({
      openOrderDetailsModal: false,
      orderId: null
    });
  };

  if (!orderId) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      setIsOpen={(open) => setIsOpen({
        openOrderDetailsModal: open,
        orderId
      })}
      title={`Order #${orderId ? orderId.substring(0, 8) : ''}`}
      size="lg"
    >
      {loading ? (
        <div className="p-6">
          <Loader loading={true} />
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-destructive mb-2">Error loading order details</div>
          <Button onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Order Details</h2>
                <p className="text-muted-foreground">Placed on {new Date(data.order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  data.order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                    data.order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                      data.order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                  }`}>
                  {data.order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Customer</h3>
              </div>
              <p className="font-medium">{data.order.client.fullName}</p>
              <p className="text-sm text-muted-foreground">{data.order.client.email}</p>
              {data.order.deliveryAddress && (
                <div className="mt-2">
                  <p className="text-sm">Delivery Address:</p>
                  <p className="text-sm">{data.order.deliveryAddress}</p>
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Shipping</h3>
              </div>
              <p className="text-sm">Delivery Fee: ${data.order.deliveryFee.toFixed(2)}</p>
              {data.order.shipping && (
                <>
                  <p className="text-sm">Carrier: {data.order.shipping.carrier}</p>
                  <p className="text-sm">Tracking #: {data.order.shipping.trackingNumber}</p>
                </>
              )}
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Payment</h3>
              </div>
              <p className="text-sm">Method: {data.order.payment?.method}</p>
              <p className="text-sm">Status: {data.order.payment?.status}</p>
              <p className="font-medium mt-2">Total: ${data.order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {data.order.products.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.title}</h4>
                    <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Close
            </Button>
            {data.order.status === 'PROCESSING' && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // In a real app, you'd call a mutation to update order status
                  alert('Order marked as completed');
                  handleClose();
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
            {data.order.status !== 'CANCELLED' && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this order?')) {
                    // In a real app, you'd call a mutation to cancel the order
                    alert('Order cancelled');
                    handleClose();
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      )}
    </ResponsiveModal>
  );
}