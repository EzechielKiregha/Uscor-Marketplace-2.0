"use client";

import { useCart } from "@/app/context/use-cart";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { GET_BUSINESS_BY_ID } from "@/graphql/business.gql";
import { GENERATE_ORDER_RECEIPT, GET_ORDER_BY_ID } from "@/graphql/order.gql";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Smartphone,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null);
  const [orderStatus, setOrderStatus] = useState<
    "processing" | "shipped" | "delivered"
  >("processing");
  const [businessMap, setBusinessMap] = useState<Record<string, any>>({});
  const [receiptData, setReceiptData] = useState<any>(null);
  const { showToast } = useToast();
  const apolloClient = useApolloClient();
  const [generateOrderReceipt] = useMutation(GENERATE_ORDER_RECEIPT);

  const orderId = searchParams.get("orderId");

  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(GET_ORDER_BY_ID, {
    variables: { id: orderId },
    skip: !orderId,
  });

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    if (queryLoading) {
      setLoading(true);
      return;
    }

    if (error) {
      console.error("Order query error:", error);
      setLoading(false);
      return;
    }

    const orderData = data?.order;
    if (!orderData) {
      setLoading(false);
      return;
    }

    const processOrder = async () => {
      clearCart();
      setOrder(orderData);
      setOrderStatus(
        orderData.status?.toLowerCase() === "shipped"
          ? "shipped"
          : orderData.status?.toLowerCase() === "delivered"
            ? "delivered"
            : "processing",
      );

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      setEstimatedDelivery(deliveryDate);

      const businessIds = Array.from(
        new Set<string>(
          (orderData.products || [])
            .map((item: any) => item.product?.businessId)
            .filter((id: any): id is string => Boolean(id)),
        ),
      );

      const businessMap: Record<string, any> = {};
      if (businessIds.length > 0) {
        try {
          const responses = await Promise.all(
            businessIds.map((businessId: string) =>
              apolloClient.query({
                query: GET_BUSINESS_BY_ID,
                variables: { id: businessId },
              }),
            ),
          );

          responses.forEach((response) => {
            const business = response.data?.business;
            if (business) {
              businessMap[business.id] = business;
            }
          });
        } catch (businessError) {
          console.error("Business query error:", businessError);
        }
      }

      setBusinessMap(businessMap);

      const productsTotal = (orderData.products || []).reduce(
        (sum: number, item: any) => sum + item.product.price * item.quantity,
        0,
      );
      const paymentAmount =
        orderData.payment?.amount ?? productsTotal + orderData.deliveryFee;

      const receiptProducts = (orderData.products || []).map((item: any) => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        businessId: item.product.businessId,
        image: item.product.medias?.[0]?.url ?? null,
      }));

      const receiptBusinesses = Object.fromEntries(
        Object.entries(businessMap).map(([businessId, business]) => [
          businessId,
          {
            id: business.id,
            name: business.name,
            avatar: business.avatar,
            businessType: business.businessType,
          },
        ]),
      );

      setReceiptData({
        orderId: orderData.id,
        client: {
          id: orderData.client.id,
          fullName: orderData.client.fullName,
          email: orderData.client.email,
        },
        deliveryAddress: {
          street: orderData.deliveryAddress?.street,
          city: orderData.deliveryAddress?.city,
          country: orderData.deliveryAddress?.country,
          postalCode: orderData.deliveryAddress?.postalCode,
        },
        payment: {
          amount: orderData.payment?.amount,
          method: orderData.payment?.method,
          status: orderData.payment?.status,
          qrCode: orderData.payment?.qrCode,
        },
        products: receiptProducts,
        businesses: receiptBusinesses,
        subtotal: productsTotal,
        deliveryFee: orderData.deliveryFee,
        total: paymentAmount,
        createdAt: orderData.createdAt,
      });

      setLoading(false);
    };

    processOrder();
  }, [orderId, queryLoading, error, data, clearCart, apolloClient]);

  const handleDownloadReceipt = async () => {
    if (!order || !receiptData) return;

    setIsDownloading(true);

    try {
      const response = await generateOrderReceipt({
        variables: {
          input: {
            orderId: order.id,
            email: order.client?.email,
          },
        },
      });

      const receiptUrl = response?.data?.generateOrderReceipt?.receiptUrl;
      const fileName = response?.data?.generateOrderReceipt?.fileName;

      if (receiptUrl) {
        const link = document.createElement("a");
        link.href = receiptUrl;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        if (fileName) {
          link.download = fileName;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const payload = JSON.stringify(receiptData, null, 2);
        const blob = new Blob([payload], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `receipt_${order.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setShowReceipt(true);
      showToast(
        "success",
        "Receipt Prepared",
        "Your receipt is ready for download.",
      );
    } catch (error) {
      console.error("Receipt generation failed:", error);
      showToast("error", "Receipt Failed", "Could not generate receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTrackOrder = () => {
    showToast("info", "Order Tracking", "Order tracking is coming soon!");
  };

  const handleContactSeller = (businessId: string) => {
    showToast("info", "Contact Seller", "Opening chat with seller...");
    // In a real app, this would navigate to the chat page
    router.push(`/marketplace/chat?businessId=${businessId}`);
  };

  const handleContinueShopping = () => {
    router.push("/marketplace");
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case "ARTISAN":
        return "🎨";
      case "BOOKSTORE":
        return "📚";
      case "ELECTRONICS":
        return "🔌";
      case "HARDWARE":
        return "🔨";
      case "GROCERY":
        return "🛒";
      case "CAFE":
        return "☕";
      case "RESTAURANT":
        return "🍽️";
      case "RETAIL":
        return "🏬";
      case "BAR":
        return "🍷";
      case "CLOTHING":
        return "👕";
      default:
        return "🏢";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "TOKEN":
        return <CreditCard className="h-5 w-5" />;
      case "MOBILE_MONEY":
        return <Smartphone className="h-5 w-5" />;
      case "CASH":
        return <Package className="h-5 w-5" />;
      case "CARD":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "TOKEN":
        return "Token Payment (uTn)";
      case "MOBILE_MONEY":
        return "Mobile Money";
      case "CASH":
        return "Cash on Delivery";
      case "CARD":
        return "Credit/Debit Card";
      default:
        return method;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "bg-warning/10 text-warning border-warning/20";
      case "SHIPPED":
        return "bg-info/10 text-info border-info/20";
      case "DELIVERED":
        return "bg-success/10 text-success border-success/20";
      case "CANCELLED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Processing Your Order</h2>
          <p className="text-muted-foreground">
            Please wait while we confirm your purchase
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-card border border-border rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for. This order may have
            been cancelled or there might be an issue with your request.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleContinueShopping}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  const businessGroups = order.businessGroups || [];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order #{order.id} has been placed
            successfully.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div
              className={`border ${getOrderStatusColor(order.status)} rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${getOrderStatusColor(order.status).replace("bg-", "bg-").replace("text-", "text-").replace("border-", "")}`}
                >
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Order Status</h3>
                  <p className="mt-1">
                    {order.status === "PROCESSING" ? "Processing" : "Shipped"}
                  </p>
                  {estimatedDelivery && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.status === "PROCESSING"
                        ? `Estimated delivery: ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                        : `Expected delivery: ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Groups */}

            {businessGroups.map((group: any) => (
              <div
                key={group.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Business avatar + name */}
                    <h2 className="font-semibold">{group.business.name}</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSeller(group.business.id)}
                  >
                    Chat
                  </Button>
                </div>

                <div className="p-4">
                  {group.items.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-3 mb-4">
                      <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden border border-border">
                        {item.product.medias?.[0]?.url ? (
                          <img
                            src={item.product.medias[0].url}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {item.product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-medium mt-1">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${group.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${group.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* {Object.values(businessGroups).map((group: any, index: number) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {group.business.avatar ? (
                      <img
                        src={group.business.avatar}
                        alt={group.business.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xl">
                          {getBusinessTypeIcon(group.business.businessType)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h2 className="font-semibold">{group.business.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {group.business.businessType === "ARTISAN" &&
                          "Artisan & Handcrafted Goods"}
                        {group.business.businessType === "BOOKSTORE" &&
                          "Bookstore & Stationery"}
                        {group.business.businessType === "ELECTRONICS" &&
                          "Electronics & Gadgets"}
                        {group.business.businessType === "HARDWARE" &&
                          "Hardware & Tools"}
                        {group.business.businessType === "GROCERY" &&
                          "Grocery & Convenience"}
                        {group.business.businessType === "CAFE" &&
                          "Café & Coffee Shops"}
                        {group.business.businessType === "RESTAURANT" &&
                          "Restaurant & Dining"}
                        {group.business.businessType === "RETAIL" &&
                          "Retail & General Stores"}
                        {group.business.businessType === "BAR" && "Bar & Pub"}
                        {group.business.businessType === "CLOTHING" &&
                          "Clothing & Accessories"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSeller(group.business.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </div>

                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    {group.items.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden border border-border">
                          {item.product.medias?.[0]?.url ? (
                            <img
                              src={item.product.medias[0].url}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {item.product.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          <p className="font-medium mt-1">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${group.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span>${order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-border mt-2">
                      <span>Total</span>
                      <span>
                        ${(group.subtotal + order.deliveryFee).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))} */}

            {/* Delivery Information */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-semibold">Delivery Address</h2>
                  <p className="text-sm text-muted-foreground">
                    Where your order will be delivered
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p>{order?.deliveryAddress?.street}</p>
                <p>
                  {order?.deliveryAddress?.city},{" "}
                  {order?.deliveryAddress?.country}
                </p>
                {order?.deliveryAddress?.postalCode && (
                  <p>Postal Code: {order?.deliveryAddress?.postalCode}</p>
                )}
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg flex items-start gap-2">
                <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Standard Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {estimatedDelivery
                      ? `Estimated delivery by ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "Processing"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-8">
              <div className="p-4 bg-muted border-b border-border">
                <h2 className="font-semibold">Order Summary</h2>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Number</span>
                    <span>#{order.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Date</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Payment Method
                    </span>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(order.payment.method)}
                      <span>{getPaymentMethodName(order.payment.method)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      $
                      {order.products
                        .reduce(
                          (sum: number, item: any) =>
                            sum + item.product.price * item.quantity,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border mt-2">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        order.products.reduce(
                          (sum: number, item: any) =>
                            sum + item.product.price * item.quantity,
                          0,
                        ) + order.deliveryFee
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 border-t border-border">
                <Button
                  className="w-full bg-primary hover:bg-accent text-primary-foreground"
                  onClick={() => {
                    if (order.receiptUrl) {
                      window.open(order.receiptUrl, "_blank");
                      return;
                    } else {
                      handleDownloadReceipt();
                    }
                  }}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {order.receiptUrl ? "View Receipt" : "Download Receipt"}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleTrackOrder}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                className="w-full h-12 text-lg"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 text-lg"
                onClick={() => router.push("/client")}
              >
                View All Orders
              </Button>
            </div>

            {/* Recommendations */}
            <div className="mt-6 bg-card border border-border rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Star className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">Leave a Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Help others by sharing your experience
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {Object.values(businessGroups).map(
                  (group: any, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        router.push(`/b-view/${group.business.id}`)
                      }
                    >
                      <div className="flex items-center gap-2">
                        {group.business.avatar ? (
                          <img
                            src={group.business.avatar}
                            alt={group.business.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs">
                              {getBusinessTypeIcon(group.business.businessType)}
                            </span>
                          </div>
                        )}
                        <span>Review {group.business.name}</span>
                      </div>
                    </Button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Receipt Downloaded</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your receipt has been saved to your device
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowReceipt(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">receipt_{order.id}.pdf</p>
                      <p className="text-sm text-muted-foreground">
                        {(
                          order.products.reduce(
                            (sum: number, item: any) =>
                              sum + item.product.price * item.quantity,
                            0,
                          ) + order.deliveryFee
                        ).toFixed(2)}{" "}
                        USD
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowReceipt(false)}
                  >
                    Close
                  </Button>
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    onClick={() => router.push("/marketplace/orders")}
                  >
                    View Order History
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
