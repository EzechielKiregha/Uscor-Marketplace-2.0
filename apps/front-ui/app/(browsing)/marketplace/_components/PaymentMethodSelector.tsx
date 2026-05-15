// marketplace/_components/PaymentMethodSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Banknote, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { Input } from "@/components/ui/input";
import PaymentCode from "../checkout/paymentCode";

interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface PaymentMethodSelectorProps {
  businessPaymentMethods: string[];
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
  amount: number;
  businessName: string;
  isBusinessPayment: boolean;
}

export default function PaymentMethodSelector({
  businessPaymentMethods,
  selectedMethod,
  onMethodSelect,
  amount,
  businessName,
  isBusinessPayment,
}: PaymentMethodSelectorProps) {
  const { showToast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    mobileMoneyProvider: "",
    mobileMoneyPhone: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: "TOKEN",
      label: "Token Payment (uTn)",
      icon: CreditCard,
      description: "Pay with USCOR tokens (1 uTn = $10)",
    },
    {
      id: "MOBILE_MONEY",
      label: "Mobile Money",
      icon: Smartphone,
      description: "MTN, Airtel, Orange, M-Pesa",
    },
    {
      id: "CASH",
      label: "Cash on Delivery",
      icon: Banknote,
      description: "Pay in cash when receiving your order",
    },
    {
      id: "CARD",
      label: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard",
    },
  ];

  const filteredMethods = paymentMethods.filter((method) =>
    businessPaymentMethods.includes(method.id),
  );

  const handleMethodSelect = (methodId: string) => {
    onMethodSelect(methodId);

    // Show payment modal for certain methods
    if (["MOBILE_MONEY", "CARD"].includes(methodId)) {
      setShowPaymentModal(true);
    }
  };

  const handleConfirmPayment = () => {
    if (
      selectedMethod === "MOBILE_MONEY" &&
      (!paymentDetails.mobileMoneyProvider || !paymentDetails.mobileMoneyPhone)
    ) {
      showToast("error", "Payment Error", "Please enter mobile money details");
      return;
    }

    if (
      selectedMethod === "CARD" &&
      (!paymentDetails.cardNumber ||
        !paymentDetails.cardName ||
        !paymentDetails.cardExpiry ||
        !paymentDetails.cardCvv)
    ) {
      showToast("error", "Payment Error", "Please complete card details");
      return;
    }

    showToast(
      "success",
      "Payment Method Set",
      `Payment will be processed via ${selectedMethod}`,
    );
    setShowPaymentModal(false);
  };

  const handleMobileMoneyPayment = () => {
    if (
      !paymentDetails.mobileMoneyPhone ||
      !paymentDetails.mobileMoneyProvider
    ) {
      showToast("error", "Payment Error", "Please enter mobile money details");
      return;
    }

    const phone = paymentDetails.mobileMoneyPhone.replace(/\D/g, "");
    if (phone.length < 9) {
      showToast("error", "Payment Error", "Invalid phone number");
      return;
    }

    // Generate USSD code based on provider
    let ussdCode = "";
    switch (paymentDetails.mobileMoneyProvider) {
      case "MTN":
        ussdCode = `*180*${amount}*${phone}#`;
        break;
      case "AIRTEL":
        ussdCode = `*182*${amount}*${phone}#`;
        break;
      case "ORANGE":
        ussdCode = `*150*${amount}*${phone}#`;
        break;
      case "MPESA":
        ussdCode = `*334*${amount}*${phone}#`;
        break;
      default:
        ussdCode = `Please dial your provider's payment code`;
    }

    showToast("info", "Payment Instruction", `Dial: ${ussdCode}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Payment Method</h3>

      {filteredMethods.length === 0 ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">
                No payment methods available
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This business does not have any payment methods configured.
                Please contact the business owner.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <RadioGroup
          value={selectedMethod || ""}
          onValueChange={handleMethodSelect}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50 border-border"
                }`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor={method.id}
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <method.icon className="h-5 w-5" />
                    {method.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {selectedMethod && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Payment Details</h4>

          {selectedMethod === "TOKEN" && (
            <div className="text-sm">
              <p>
                Amount to pay:{" "}
                <span className="font-medium">
                  {(amount / 10).toFixed(2)} uTn
                </span>
              </p>
              <p className="text-muted-foreground">1 uTn = $10</p>
            </div>
          )}

          {selectedMethod === "MOBILE_MONEY" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="provider">Provider</Label>
                  <select
                    id="provider"
                    value={paymentDetails.mobileMoneyProvider}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        mobileMoneyProvider: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select provider</option>
                    <option value="MTN">MTN</option>
                    <option value="AIRTEL">Airtel</option>
                    <option value="ORANGE">Orange</option>
                    <option value="MPESA">M-Pesa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={paymentDetails.mobileMoneyPhone}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        mobileMoneyPhone: e.target.value,
                      })
                    }
                    placeholder="+250 788 123 456"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-accent text-primary-foreground"
                onClick={handleMobileMoneyPayment}
              >
                Get Payment Code
              </Button>
            </div>
          )}

          {selectedMethod === "CARD" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  value={paymentDetails.cardName}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      cardName: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  value={paymentDetails.cardNumber}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      cardNumber: e.target.value,
                    })
                  }
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="text"
                    value={paymentDetails.cardExpiry}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        cardExpiry: e.target.value,
                      })
                    }
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    value={paymentDetails.cardCvv}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        cardCvv: e.target.value,
                      })
                    }
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "CASH" && (
            <div className="text-sm">
              <p>Pay in cash when your order is delivered</p>
              <p className="text-muted-foreground mt-1">
                Make sure to have the exact amount ready
              </p>
            </div>
          )}
        </div>
      )}

      {showPaymentModal && selectedMethod && (
        <PaymentCode
          amount={amount}
          paymentMethod={selectedMethod}
          businessName={businessName}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleConfirmPayment}
          isBusinessPayment={isBusinessPayment}
        />
      )}
    </div>
  );
}
