// marketplace/checkout/paymentCode.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast-provider";
import {
  CreditCard,
  Smartphone,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface PaymentCodeProps {
  amount: number;
  paymentMethod: string;
  businessName: string;
  onClose: () => void;
  onConfirm: () => void;
  isBusinessPayment: boolean;
}

export default function PaymentCode({
  amount,
  paymentMethod,
  businessName,
  onClose,
  onConfirm,
  isBusinessPayment,
}: PaymentCodeProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState("");
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showPaymentCode, setShowPaymentCode] = useState(false);
  const [paymentCode, setPaymentCode] = useState("");

  useEffect(() => {
    // Format card number as user types
    if (paymentMethod === "CARD" && cardNumber) {
      const formatted = cardNumber
        .replace(/\D/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      setCardNumber(formatted);
    }

    // Format expiry as MM/YY
    if (paymentMethod === "CARD" && cardExpiry) {
      const digits = cardExpiry.replace(/\D/g, "").slice(0, 4);
      if (digits.length <= 2) {
        setCardExpiry(digits);
      } else {
        setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
      }
    }
  }, [paymentMethod, cardNumber, cardExpiry]);

  const generatePaymentCode = () => {
    setIsLoading(true);

    setTimeout(() => {
      if (paymentMethod === "MOBILE_MONEY") {
        if (!mobileMoneyProvider || !mobileMoneyPhone) {
          showToast(
            "error",
            "Payment Error",
            "Please enter mobile money details",
          );
          setIsLoading(false);
          return;
        }

        const phone = mobileMoneyPhone.replace(/\D/g, "");
        if (phone.length < 9) {
          showToast("error", "Payment Error", "Invalid phone number");
          setIsLoading(false);
          return;
        }

        // Generate USSD code based on provider
        let ussdCode = "";
        switch (mobileMoneyProvider) {
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

        setPaymentCode(ussdCode);
      } else if (paymentMethod === "CARD") {
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
          showToast("error", "Payment Error", "Please complete card details");
          setIsLoading(false);
          return;
        }

        // In a real app, this would generate a secure token
        setPaymentCode("Card details secured. Ready to process payment.");
      }

      setShowPaymentCode(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleConfirm = () => {
    if (paymentMethod === "MOBILE_MONEY" && !showPaymentCode) {
      generatePaymentCode();
      return;
    }

    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">Payment Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isBusinessPayment
                  ? `Complete payment to ${businessName}`
                  : "Complete your payment"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {paymentMethod === "MOBILE_MONEY" && !showPaymentCode && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="provider">Mobile Money Provider</Label>
                <select
                  id="provider"
                  value={mobileMoneyProvider}
                  onChange={(e) => setMobileMoneyProvider(e.target.value)}
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
                  value={mobileMoneyPhone}
                  onChange={(e) => setMobileMoneyPhone(e.target.value)}
                  placeholder="+250 788 123 456"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-accent text-primary-foreground"
                  onClick={generatePaymentCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Payment Code"
                  )}
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === "MOBILE_MONEY" && showPaymentCode && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Dial this code</h3>
                </div>
                <div className="text-center py-3">
                  <div className="bg-background border border-border rounded-lg p-3 font-mono text-lg">
                    {paymentCode}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  This code will charge ${amount.toFixed(2)} to your mobile
                  money account
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentCode(false)}
                >
                  Back
                </Button>
                <Button
                  className="bg-primary hover:bg-accent text-primary-foreground"
                  onClick={onConfirm}
                >
                  Payment Complete
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === "CARD" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
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
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-accent text-primary-foreground"
                  onClick={handleConfirm}
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === "TOKEN" && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Token Payment</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {(amount / 10).toFixed(2)} uTn
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equivalent</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{(amount / 10).toFixed(2)} uTn</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-accent text-primary-foreground"
                  onClick={onConfirm}
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === "CASH" && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning mt-1" />
                  <div>
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please have ${amount.toFixed(2)} ready when your order is
                      delivered.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-accent text-primary-foreground"
                  onClick={onConfirm}
                >
                  Confirm Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
