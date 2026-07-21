// app/business/orders/_components/OrderDetailsModal.tsx
"use client";

import ResponsiveModal from "@/app/(Business)/business/_components/responsive-modal";
import ActivityTimeline, { buildOrderTimelineItems } from "@/components/ActivityTimeline";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { CANCEL_ORDER, GET_ORDER_BY_ID } from "@/graphql/order.gql";
import { UPDATE_PAYMENT_TRANSACTION } from "@/graphql/payment.gql";
import { removeTypename } from "@/lib/removeTypeName";
import { useMe } from "@/lib/useMe";
import { useMutation, useQuery } from "@apollo/client";
import { CreditCard, Package, Truck } from "lucide-react";
import { useOpenOrderDetailsModal } from "../../../_hooks/use-open-order-details-modal";

export default function OrderDetailsModal() {
  const { isOpen, setIsOpen, orderId } = useOpenOrderDetailsModal();
  const { user } = useMe()
  const { showToast } = useToast()

  const { data, loading, error } = useQuery(GET_ORDER_BY_ID, {
    variables: { id: orderId },
    skip: !orderId,
  });

  const [updatePaymentTransaction] = useMutation(UPDATE_PAYMENT_TRANSACTION);
  const [cancelOrder] = useMutation(CANCEL_ORDER);

  const orderData = removeTypename(data?.order);

  const handleClose = () => {
    setIsOpen({
      openOrderDetailsModal: false,
      orderId: null,
    });
  };

  const handleOrderPayment = () => {
    try {
        updatePaymentTransaction({
          variables: {
            id: orderData.payment.id,
            input: {
              status: "COMPLETED",
            },
            phone: user?.phone
          },
        });
    } catch (error: any) {
        showToast(
          "info",
          "Permission",
          error.message,
          true,
          4000,
          "top-center"
        );
    }
  };

  if (!orderId) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      setIsOpen={(open) =>
        setIsOpen({
          openOrderDetailsModal: open,
          orderId,
        })
      }
      title={`Order #${orderId ? orderId.substring(0, 8) : ""}`}
      size="xl"
    >
      {loading ? (
        <div className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-destructive mb-2">
            Error loading order details
          </div>
          <Button onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Order Details</h2>
                <p className="text-muted-foreground">
                  Placed on {new Date(orderData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    orderData.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : orderData.status === "PROCESSING"
                        ? "bg-blue-100 text-blue-800"
                        : orderData.status === "SHIPPED"
                          ? "bg-purple-100 text-purple-800"
                          : orderData.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {orderData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border hover:border-primary  rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Customer</h3>
              </div>
              <p className="font-medium">{orderData.client.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {orderData.client.email}
              </p>
              {orderData.deliveryAddress && (
                <div className="mt-2">
                  <p className="text-sm">Delivery Address:</p>
                  <p className="text-sm">
                    {orderData.deliveryAddress.street} -{" "}
                    {orderData.deliveryAddress.city}
                  </p>
                </div>
              )}
            </div>

            <div className="border hover:border-primary  rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Shipping</h3>
              </div>
              <p className="text-sm">
                Delivery Fee: $
                {orderData.deliveryFee ? orderData.deliveryFee : 0}
              </p>
              {orderData.shipping && (
                <>
                  <p className="text-sm">
                    Carrier: {orderData.shipping.carrier}
                  </p>
                  <p className="text-sm">
                    Tracking #: {orderData.shipping.trackingNumber}
                  </p>
                </>
              )}
            </div>

            <div className="border hover:border-primary  rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Payment</h3>
              </div>
              <p className="text-sm">Method: {orderData.payment?.method}</p>
              <p className="text-sm">Status: {orderData.payment?.status}</p>
              <p className="font-medium mt-2">
                Total:{" "}
                {orderData.payment?.method === "TOKEN"
                  ? (orderData.payment?.amount / 10).toFixed(2)
                  : orderData.payment?.amount || 0}{" "}
                {orderData.payment?.method === "TOKEN" ? "uTns" : "$"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {orderData.products.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 border hover:border-primary  rounded-lg"
                >
                  <img
                    src={
                      item.product.medias && item.product.medias.length > 0
                        ? item.product.medias[0].url
                        : `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(item.product.title)}`
                    }
                    alt={item.product.title}
                    className="w-16 h-16 bg-muted rounded flex items-center justify-center object-cover"
                    onError={(event) => {
                      event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(item.product.title)}`;
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.product.price} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${item.product.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Activity Timeline */}
          <div className="border hover:border-primary  rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Activity</h3>
            <ActivityTimeline
              items={buildOrderTimelineItems(orderData.status, orderData.createdAt)}
            />
          </div>

          <div className="flex justify-between items-center gap-3 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Order processing is handled by workers
            </p>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </ResponsiveModal>
  );
}
