"use client";

import { useCart } from "@/app/context/use-cart";
import Loader from "@/components/seraui/Loader";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GET_CUSTOMER_POINTS,
  GET_LOYALTY_PROGRAMS,
} from "@/graphql/loyalty.gql";
import { CREATE_ORDER } from "@/graphql/order.gql";
import { GET_ACCOUNT_BALANCE } from "@/graphql/wallet.gql";
import { Address } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { formatPrice } from "@/lib/utils";
import { useMutation, useQuery } from "@apollo/client";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  MapPin,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddressSelector from "../_components/AddressSelector";
import { GetBusinessType } from "../_components/BusinessType";
import BusinessTypeIcon from "../_components/BusinessTypeIcons";
import OrderSummary from "../_components/OrderSummary";
import PaymentMethodSelector from "../_components/PaymentMethodSelector";

interface RwandaLocation {
  status: string;
  statusCode: number;
  message: string;
  data: Record<string, Array<Record<string, string>>>;
}

function getTierForPoints(tiers: any[] = [], points: number) {
  if (!tiers?.length) return null;
  return (
    [...tiers]
      .sort((a, b) => a.minPoints - b.minPoints)
      .reverse()
      .find((tier) => points >= tier.minPoints) || tiers[0]
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { getItemCount, items, clearCart } = useCart();
  const { showToast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [selectedBusinessPaymentMethod, setSelectedBusinessPaymentMethod] =
    useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<any | undefined>();
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

  const activeBusinessOrder = groupedOrders[activeBusinessIndex];
  const activeBusinessId = activeBusinessOrder?.businessId;

  const { data: loyaltyProgramsData } = useQuery(GET_LOYALTY_PROGRAMS, {
    variables: { businessId: activeBusinessId || "" },
    skip: !activeBusinessId,
    fetchPolicy: "cache-only",
  });

  const { data: customerPointsData } = useQuery(GET_CUSTOMER_POINTS, {
    variables: {
      businessId: activeBusinessId || "",
      clientId: user?.id || "",
    },
    skip: !activeBusinessId || !user?.id,
  });

  // Client balance
  const balanceResult = useQuery(GET_ACCOUNT_BALANCE, {
    variables: {
      userId: user?.id,
      userType: "CLIENT",
    },
    skip: !user?.id,
  });

  const balance = balanceResult?.data?.accountBalance?.availableAmount;
  const tokenBalance =
    balanceResult?.data?.accountBalance?.tokenBalance?.availableAmount;

  const loyaltyProgram =
    loyaltyProgramsData?.loyaltyPrograms?.[0] ||
    customerPointsData?.customerPoints?.program;
  const currentBusinessPoints =
    customerPointsData?.customerPoints?.totalPoints ?? 0;
  const pointsToEarnNow = loyaltyProgram
    ? Math.floor(
        ((activeBusinessOrder?.subtotal ?? 0) *
          (loyaltyProgram.pointsPerPurchase ?? 0)) /
          2,
      )
    : 0;
  const projectedPointsAfterPayment = currentBusinessPoints + pointsToEarnNow;
  const currentTier = getTierForPoints(
    loyaltyProgram?.tiers,
    currentBusinessPoints,
  );
  const projectedTier = getTierForPoints(
    loyaltyProgram?.tiers,
    projectedPointsAfterPayment,
  );

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const deliveryFee = 5.0; // Fixed delivery fee
  const [total, setTotal] = useState(subtotal + deliveryFee);
  const uTnAmount = total / 10; // 1 uTn = $10

  useEffect(() => {
    // Group items by business
    const businessGroups = items.reduce((groups: any, item) => {
      const businessId = item.product.business?.id ?? "none";
      //   console.log({ item });
      if (!groups[businessId]) {
        groups[businessId] = {
          businessId,
          items: [],
          subtotal: 0,
          deliveryFee: 5.0,
          total: 5.0,
          business: {},
        };
      }

      groups[businessId].items.push(item);
      groups[businessId].subtotal += item.product.price * item.quantity;
      groups[businessId].total =
        groups[businessId].subtotal + groups[businessId].deliveryFee;
      groups[businessId].business = item.product?.business;

      return groups;
    }, {});

    setGroupedOrders(Object.values(businessGroups));

    // Set default payment method
    if (groupedOrders.length > 0) {
      setPaymentMethod("MOBILE_MONEY");
    }
  }, [items, router]);

  useEffect(() => {
    if (useUnifiedPayment) {
      setPaymentMethod("MOBILE_MONEY");
    }
  }, [paymentMethod, useUnifiedPayment]);

  //   console.log("Grouped Orders:", groupedOrders);

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

  const unifiedTotal = groupedOrders.reduce(
    (sum, order) => sum + (order?.total || 0),
    0,
  );

  const handleCheckout = async () => {
    if (!selectedAddress) {
      showToast(
        "error",
        "Address Required",
        "Please select a delivery address",
      );
      return;
    }

    if (!paymentMethod && !useUnifiedPayment) {
      showToast("error", "Payment Error", "Please select a payment method");
      return;
    }

    setIsProcessing(true);

    try {
      // Helper function to extract only digits
      const onlyDigits = (str: string) => str.replace(/\D/g, "");

      // Generate QR code based on payment method
      let qrCode: string | undefined;
      if (paymentMethod === "TOKEN") {
        qrCode = `uTn:${uTnAmount.toFixed(2)}`;
      } else if (paymentMethod === "MOBILE_MONEY") {
        const phoneDigits = onlyDigits(user?.phone || "");
        qrCode = `MOMO:${paymentDetails.mobileMoneyProvider?.trim() || "USCOR201"}:${phoneDigits}`;
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
            deliveryAddress: selectedAddress.id,
            qrCode,
            orderProducts: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              businessId: item.product?.business?.id,
              deliveryFee: 5.0,
              price: Number(item.product.price),
            })),
            useUnifiedPayment,
            payment: {
              method: paymentMethod,
              status: "PENDING",
              amount: total,
            },
          },
        },
      });

      const mainOrderId = clientOrderData?.createOrder?.id;

      if (!mainOrderId) {
        throw new Error("Failed to create client order");
      }

      // Create individual orders for each business
      const businessOrderPromises = groupedOrders.map(async (order) => {
        const businessOrderProducts = order.items.map(
          ({ product, quantity }: any) => ({
            productId: product.id,
            quantity: quantity,
            businessId: product?.business?.id,
            deliveryFee: 5.0,
            price: Number(product.price),
          }),
        );

        return createOrder({
          variables: {
            input: {
              clientId: user?.id,
              clientOrderId: mainOrderId, // Link to main client order
              deliveryFee: order.deliveryFee,
              deliveryAddress: selectedAddress.id,
              orderProducts: businessOrderProducts,
              useUnifiedPayment,
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
      router.push(`/marketplace/orders/confirmation?orderId=${mainOrderId}`);
      // Clear cart and redirect to order confirmation
      clearCart();
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

  if (getItemCount() === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button variant="default" onClick={() => router.push("/marketplace")}>
            <ShoppingBag className="h-5 w-5 mr-2" />
            Start Shopping
          </Button>
        </div>
      </div>
    );
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
                  clientId={user ? user.id : ""}
                />
              </div>
            </div>

            {/* Business Tabs */}
            {groupedOrders.length > 1 && !useUnifiedPayment && (
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
                        onClick={() => {
                          setActiveBusinessIndex(index);
                          setSelectedBusiness(order.business);
                        }}
                      >
                        {order.business?.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2 text-foreground">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Payment Method
                </h2>

                {groupedOrders.length > 1 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="unifiedPayment"
                      checked={useUnifiedPayment}
                      onChange={(e) => setUseUnifiedPayment(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <Label
                      htmlFor="unifiedPayment"
                      className="text-sm font-medium cursor-pointer select-none"
                    >
                      Unified Payment
                    </Label>
                  </div>
                )}
              </div>

              <div className="p-4">
                {useUnifiedPayment ? (
                  /* Gold Glowing USCOR Mock Card Replacement */
                  <div className="bg-card border border-amber-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(245,158,11,0.12)] relative overflow-hidden transition-all duration-300">
                    {/* Decorative Golden Light Effect */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

                    {/* USCOR Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-amber-500/10">
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                          <ShieldCheck className="h-5 w-5 text-amber-500 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm tracking-tight text-amber-600 dark:text-amber-400">
                            USCOR Payment System
                          </h3>
                          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                            Unified Network Routing Channel
                          </p>
                        </div>
                      </div>

                      <div className="self-start sm:self-center shrink-0">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <CheckCircle className="h-3 w-3" />
                          <span>USCOR Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* USCOR Core Metrics */}
                    <div className="space-y-2 text-sm relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-600/70 dark:text-amber-400/70">
                          Total Unified Balance
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {/* Dynamically computes total sum of all order items when unified */}
                          ${unifiedTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-amber-500/10">
                        <span className="text-amber-600/70 dark:text-amber-400/70">
                          Clearance Status
                        </span>
                        <span className="text-xs bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Instant Authorization
                        </span>
                      </div>
                      {/* Unified Payment Info */}
                      {groupedOrders.length > 1 && useUnifiedPayment && (
                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <h3 className="font-medium text-primary">
                                Unified Payment
                              </h3>
                              <p className="text-sm mt-1">
                                USCOR will handle payments to each business.
                                You'll pay once and we'll distribute funds.
                              </p>
                            </div>
                          </div>
                          <Button
                            className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 text-lg"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <span className="animate-spin rounded-full h-4 w-4 mr-2 border-2 border-white border-t-transparent"></span>
                                Processing...
                              </>
                            ) : (
                              <>Checkout • ${unifiedTotal}</>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Default Interactive Payment Form Selector */
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
                    balance={{
                      mainBalance: balance,
                      tokenBalance,
                    }}
                    businessName={`Business ${activeBusinessIndex + 1}`}
                    isBusinessPayment={
                      groupedOrders.length > 1 && !useUnifiedPayment
                    }
                  />
                )}
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
              isUsingUnifiedPayment={useUnifiedPayment}
            />

            {/* Business Details */}
            <div className="mt-6 bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm">
              {/* Header Section: Fully Responsive Wrap */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base tracking-tight text-card-foreground">
                      {selectedBusiness?.name || "Loading Business..."}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Estimated delivery: 1-3 days
                    </p>
                  </div>
                </div>

                {/* Dynamic Status Pill */}
                <div className="self-start sm:self-center shrink-0">
                  {selectedBusiness?.isVerified ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                      <CircleAlert className="h-3.5 w-3.5" />
                      <span>Not Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Info Specifications */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-sm">
                  <span className="text-muted-foreground font-medium">
                    Business Type
                  </span>
                  <span className="flex items-center gap-2 self-start sm:self-auto">
                    {BusinessTypeIcon({
                      businessType:
                        selectedBusiness?.businessType || "Electronics",
                      className: "h-4 w-4 text-primary shrink-0",
                    })}
                    <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full font-medium text-foreground">
                      {GetBusinessType({
                        businessType:
                          selectedBusiness?.businessType || "Electronics",
                      })}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pt-1 border-t border-border/40 sm:border-0">
                  <span className="text-muted-foreground font-medium">
                    Return Policy
                  </span>
                  <span className="text-foreground font-medium">14 days</span>
                </div>

                <div className="flex justify-between items-center text-sm pt-1 border-t border-border/40 sm:border-0">
                  <span className="text-muted-foreground font-medium">
                    Shipping
                  </span>
                  <span className="text-foreground font-medium">
                    Free on orders over $1,500
                  </span>
                </div>
              </div>

              {/* Loyalty Section */}
              {loyaltyProgram ? (
                <div className="mt-5 p-4 bg-muted/40 rounded-lg border border-border/80">
                  <h4 className="font-semibold text-sm text-foreground mb-3 tracking-tight">
                    Loyalty Program Summary
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program</span>
                      <span className="font-medium text-foreground">
                        {loyaltyProgram.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current tier
                      </span>
                      <span className="font-medium text-foreground">
                        {currentTier?.name ?? "Member"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current points
                      </span>
                      <span className="font-medium text-foreground">
                        {currentBusinessPoints}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Points to earn now
                      </span>
                      <span className="font-medium text-success">
                        +{pointsToEarnNow}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Projected after payment
                      </span>
                      <span className="font-medium text-foreground">
                        {projectedPointsAfterPayment}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">
                        Projected tier
                      </span>
                      <span className="font-medium text-primary">
                        {projectedTier?.name ?? currentTier?.name ?? "Member"}
                      </span>
                    </div>
                    <div className="rounded-md bg-primary/5 p-3 text-xs text-muted-foreground leading-relaxed">
                      Half of this business order's earned points are registered
                      now, with the remaining loyalty rewards processed after
                      payment completion.
                    </div>
                  </div>
                </div>
              ) : (
                activeBusinessId && (
                  <div className="mt-5 p-4 bg-muted/30 rounded-lg border border-border/60 text-xs text-muted-foreground text-center">
                    This business does not have an active loyalty program.
                  </div>
                )
              )}
            </div>
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
            isUsingUnifiedPayment={useUnifiedPayment}
          />
        </div>
      </div>
    </div>
  );
}
