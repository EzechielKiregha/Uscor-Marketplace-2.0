"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Plus,
  ShoppingBag,
  Smartphone,
  MapPin,
} from "lucide-react";
import {
  CREATE_GROUPED_ORDER,
  APPLY_PROMOTION,
  CREATE_ORDER,
} from "@/graphql/order.gql";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OrderSummary from "../_components/OrderSummary";
import PaymentMethodSelector from "../_components/PaymentMethodSelector";
import AddressSelector from "../_components/AddressSelector";
import { Address } from "@/lib/types";
import { useCart } from "@/app/context/use-cart";
import { useMe } from "@/lib/useMe";
import Loader from "@/components/seraui/Loader";

interface RwandaLocation {
  status: string;
  statusCode: number;
  message: string;
  data: Record<string, Array<Record<string, string>>>;
}

interface CheckoutPageProps {
  params: {
    businessId?: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const { getItemCount, items, clearCart } = useCart();
  const { showToast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [selectedBusinessPaymentMethod, setSelectedBusinessPaymentMethod] =
    useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBusinessIndex, setActiveBusinessIndex] = useState(0);
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotions, setAppliedPromotions] = useState<any[]>([]);
  const [showPromotionError, setShowPromotionError] = useState(false);
  const [groupedOrders, setGroupedOrders] = useState<any[]>([]);
  const [useUnifiedPayment, setUseUnifiedPayment] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const { loading: userLoading, user } = useMe();

  const [createOrder] = useMutation(CREATE_ORDER);

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const deliveryFee = 5.0; // Fixed delivery fee
  const [total, setTotal] = useState(subtotal + deliveryFee);
  const uTnAmount = total / 10; // 1 uTn = $10

  useEffect(() => {
    if (getItemCount() === 0) {
      router.push("/marketplace");
      return;
    }

    // Group items by business
    const businessGroups = items.reduce((groups: any, item) => {
      const businessId = item.product.businessId;
      if (!groups[businessId]) {
        groups[businessId] = {
          businessId,
          items: [],
          subtotal: 0,
          deliveryFee: 5.0,
          total: 5.0,
        };
      }

      groups[businessId].items.push(item);
      groups[businessId].subtotal += item.product.price * item.quantity;
      groups[businessId].total =
        groups[businessId].subtotal + groups[businessId].deliveryFee;

      return groups;
    }, {});

    setGroupedOrders(Object.values(businessGroups));

    // Set default payment method
    if (groupedOrders.length > 0) {
      setPaymentMethod("TOKEN");
    }
  }, [items, router]);

  console.log("Grouped Orders:", groupedOrders);

  if (userLoading) {
    return <Loader loading={true} />;
  }

  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) return;

    try {
      // In a real app, this would call the APPLY_PROMOTION mutation
      const mockPromotion = {
        id: "PROMO10",
        name: "10% Off",
        discountType: "PERCENTAGE",
        discountValue: 10,
        applicableBusinesses: [
          { id: groupedOrders[activeBusinessIndex]?.businessId },
        ],
        minimumPurchase: 0,
      };

      // Check if promotion applies to current business
      const appliesToBusiness = mockPromotion.applicableBusinesses.some(
        (b: any) => b.id === groupedOrders[activeBusinessIndex]?.businessId,
      );

      if (
        !appliesToBusiness ||
        groupedOrders[activeBusinessIndex]?.subtotal <
          mockPromotion.minimumPurchase
      ) {
        setShowPromotionError(true);
        setTimeout(() => setShowPromotionError(false), 3000);
        return;
      }

      // Apply discount
      let discountAmount = 0;
      if (mockPromotion.discountType === "PERCENTAGE") {
        discountAmount =
          (groupedOrders[activeBusinessIndex]?.subtotal *
            mockPromotion.discountValue) /
          100;
      } else {
        discountAmount = mockPromotion.discountValue;
      }

      // Update totals
      const newSubtotal =
        groupedOrders[activeBusinessIndex]?.subtotal - discountAmount;
      const newTotal =
        newSubtotal + groupedOrders[activeBusinessIndex]?.deliveryFee;

      // Update grouped orders
      const updatedOrders = [...groupedOrders];
      updatedOrders[activeBusinessIndex] = {
        ...updatedOrders[activeBusinessIndex],
        subtotal: newSubtotal,
        total: newTotal,
      };

      setGroupedOrders(updatedOrders);
      setTotal(newTotal);
      setAppliedPromotions([...appliedPromotions, mockPromotion]);
      setPromotionCode("");
      showToast(
        "success",
        "Promotion Applied",
        "Discount has been applied to your order",
      );
    } catch (error) {
      setShowPromotionError(true);
      setTimeout(() => setShowPromotionError(false), 3000);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setSelectedBusinessPaymentMethod(method);
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      showToast(
        "error",
        "Address Required",
        "Please select a delivery address",
      );
      return;
    }

    if (!paymentMethod) {
      showToast("error", "Payment Error", "Please select a payment method");
      return;
    }

    setIsProcessing(true);

    try {
      // Helper function to extract only digits
      const onlyDigits = (str: string) => str.replace(/\D/g, "");

      // Prepare all order products for the main client order
      const orderProducts = items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity: quantity,
      }));

      // Generate QR code based on payment method
      let qrCode: string | undefined;
      if (paymentMethod === "TOKEN") {
        qrCode = `uTn:${uTnAmount.toFixed(2)}`;
      } else if (paymentMethod === "MOBILE_MONEY") {
        const phoneDigits = onlyDigits(paymentDetails.mobileMoneyPhone || "");
        qrCode = `MOMO:${paymentDetails.mobileMoneyProvider?.trim() || ""}:${phoneDigits}`;
      } else if (paymentMethod === "CARD") {
        const last4 = onlyDigits(paymentDetails.cardNumber || "").slice(-4);
        qrCode = `CARD:****${last4}`;
      }

      // Create the main client order with all products
      const { data: clientOrderData } = await createOrder({
        variables: {
          input: {
            clientId: user?.id,
            deliveryFee,
            deliveryAddress: `${selectedAddress.street}, ${selectedAddress.city}`,
            qrCode,
            orderProducts,
            payment: {
              method: paymentMethod,
              status: "PENDING",
              amount: total,
            },
          },
        },
      });

      const clientOrderId = clientOrderData?.createOrder?.id;

      if (!clientOrderId) {
        throw new Error("Failed to create client order");
      }

      // Create individual orders for each business
      const businessOrderPromises = groupedOrders.map(async (order) => {
        const businessOrderProducts = order.items.map(
          ({ product, quantity }: any) => ({
            productId: product.id,
            quantity: quantity,
          }),
        );

        return createOrder({
          variables: {
            input: {
              businessId: order.businessId,
              clientId: user?.id,
              clientOrderId, // Link to main client order
              deliveryFee: order.deliveryFee,
              deliveryAddress: `${selectedAddress.street}, ${selectedAddress.city}`,
              orderProducts: businessOrderProducts,
              payment: {
                method: useUnifiedPayment
                  ? paymentMethod
                  : selectedBusinessPaymentMethod,
                status: "PENDING",
                amount: order.total,
              },
            },
          },
        });
      });

      await Promise.all(businessOrderPromises);

      showToast(
        "success",
        "Order Placed",
        "Your order has been placed successfully",
        true,
        5000,
      );
      // Clear cart and redirect to order confirmation
      clearCart();
      router.push(`/marketplace/orders/confirmation?orderId=${clientOrderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      showToast(
        "error",
        "Order Failed",
        "Failed to place your order. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // This should be handled by the useEffect redirect
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shopping
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </h2>
              </div>

              <div className="p-4">
                <AddressSelector
                  selectedAddress={selectedAddress}
                  onSelect={setSelectedAddress}
                  onAddNew={() => {}}
                />
              </div>
            </div>

            {/* Business Tabs */}
            {groupedOrders.length > 1 && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h2 className="font-semibold">Business Selection</h2>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {groupedOrders.map((order, index) => (
                      <Button
                        key={order.businessId}
                        variant={
                          activeBusinessIndex === index ? "default" : "outline"
                        }
                        className="flex-1 min-w-30"
                        onClick={() => setActiveBusinessIndex(index)}
                      >
                        Business {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </h2>

                {groupedOrders.length > 1 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="unifiedPayment"
                      checked={useUnifiedPayment}
                      onChange={(e) => setUseUnifiedPayment(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <Label htmlFor="unifiedPayment" className="text-sm">
                      Unified Payment
                    </Label>
                  </div>
                )}
              </div>

              <div className="p-4">
                <PaymentMethodSelector
                  businessPaymentMethods={[
                    "TOKEN",
                    "MOBILE_MONEY",
                    "CASH",
                    "CARD",
                  ]}
                  selectedMethod={selectedBusinessPaymentMethod}
                  onMethodSelect={handlePaymentMethodSelect}
                  amount={groupedOrders[activeBusinessIndex]?.total}
                  businessName={`Business ${activeBusinessIndex + 1}`}
                  isBusinessPayment={
                    groupedOrders.length > 1 && !useUnifiedPayment
                  }
                />
              </div>
            </div>

            {/* Promotion Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h2 className="font-semibold">Promotions</h2>
              </div>

              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    placeholder="Enter promotion code"
                    className="flex-1"
                  />
                  <Button variant="default" onClick={handleApplyPromotion}>
                    Apply
                  </Button>
                </div>

                {showPromotionError && (
                  <p className="text-destructive text-sm mt-2">
                    Promotion code is invalid or doesn't apply to this business
                  </p>
                )}

                {appliedPromotions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-medium">Applied Promotions:</h3>
                    {appliedPromotions.map((promo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <span>
                          {promo.name} (
                          {promo.discountType === "PERCENTAGE"
                            ? `${promo.discountValue}%`
                            : formatPrice(promo.discountValue)}{" "}
                          off)
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={groupedOrders[activeBusinessIndex]?.items}
              deliveryFee={groupedOrders[activeBusinessIndex]?.deliveryFee}
              total={groupedOrders[activeBusinessIndex]?.total}
              uTnAmount={groupedOrders[activeBusinessIndex]?.total / 10}
              onCheckout={handleCheckout}
              isProcessing={isProcessing}
            />

            {/* Business Details */}
            <div className="mt-6 bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">
                    Business {activeBusinessIndex + 1}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: 1-3 days
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Business Type</span>
                  <span>Electronics & Gadgets</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Return Policy</span>
                  <span>14 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free on orders over $1500</span>
                </div>
              </div>
            </div>

            {/* Unified Payment Info */}
            {groupedOrders.length > 1 && useUnifiedPayment && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-primary">
                      Unified Payment
                    </h3>
                    <p className="text-sm mt-1">
                      USCOR will handle payments to each business. You'll pay
                      once and we'll distribute funds.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Order Summary */}
        <div className="lg:hidden mt-6">
          <OrderSummary
            items={groupedOrders[activeBusinessIndex]?.items}
            deliveryFee={groupedOrders[activeBusinessIndex]?.deliveryFee}
            total={groupedOrders[activeBusinessIndex]?.total}
            uTnAmount={groupedOrders[activeBusinessIndex]?.total / 10}
            onCheckout={handleCheckout}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
