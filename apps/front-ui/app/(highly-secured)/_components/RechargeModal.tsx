"use client";

import { useMutation } from "@apollo/client";
import { CreditCard, DollarSign, Loader2, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import MobileMoneyPaymentUI from "@/app/(browsing)/marketplace/_components/MobileMoneyPaymentUI";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  CANCEL_PAYMENT_TRANSACTION,
  CREATE_PAYMENT_TRANSACTION_FOR_ACCOUNT_RECHARGE,
} from "@/graphql/payment.gql";

interface RechargeModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onRechargeCreated: (recharge: any) => void;
  selectedMethod?: string | null;
  userId: string;
  userType: "client" | "business" | "worker" | "admin";
}

export default function RechargeModal({
  user,
  isOpen,
  onClose,
  onRechargeCreated,
  selectedMethod,
  userId,
  userType,
}: RechargeModalProps) {
  const [amount, setAmount] = useState(10);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rechargeMethod, setRechargeMethod] = useState(
    selectedMethod || "MOBILE_MONEY",
  );
  const { showToast } = useToast();
  const [country, setCountry] = useState("RWANDA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [showUssdCode, setShowUssdCode] = useState(false);

  const [cancelPaymentTransaction] = useMutation(CANCEL_PAYMENT_TRANSACTION);
  const [createPaymentTransactionForAccountRecharge] = useMutation(
    CREATE_PAYMENT_TRANSACTION_FOR_ACCOUNT_RECHARGE,
  );

  useEffect(() => {
    if (selectedMethod) {
      setRechargeMethod(selectedMethod);
    }
  }, [selectedMethod]);

  const generateUssdCode = async () => {
    setIsSubmitting(true);

    try {
      const { data } = await createPaymentTransactionForAccountRecharge({
        variables: {
          input: {
            method: rechargeMethod,
            amount,
            status: "PENDING",
            qrCode: "Payment Initialized",
          },
        },
      });

      setPaymentId(data.createPaymentTransactionForAccountRecharge?.id);
      setShowUssdCode(true);
      setIsSubmitting(false);
    } catch (error: any) {
      showToast(
        "error",
        "Error",
        error.message || "Failed to generate USSD code",
      );
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const RECHARGE_AMOUNTS = [10000, 25000, 50000, 100000, 200000];
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {rechargeMethod.includes("MONEY") ? (
                  <Smartphone className="h-5 w-5 text-primary" />
                ) : (
                  <CreditCard className="h-5 w-5 text-primary" />
                )}
                Recharge Account
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add funds to your USCOR wallet
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium mb-1"
                >
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="RWANDA">Rwanda (advised)</option>
                  <option value="UGANDA">Uganda</option>
                  <option value="KENYA">Kenya</option>
                  <option value="TANZANIA">Tanzania</option>
                  <option value="DRC">Democratic Republic of Congo</option>
                  <option value="BURUNDI">Burundi</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="method"
                  className="block text-sm font-medium mb-1"
                >
                  Payment Method
                </label>
                <select
                  id="method"
                  value={rechargeMethod}
                  onChange={(e) => setRechargeMethod(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="MOBILE_MONEY">MTN MOMO (advised)</option>
                  <option value="AIRTEL_MONEY">Airtel Money</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            {!showUssdCode && (
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Amount to Recharge
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {RECHARGE_AMOUNTS.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={amount === value ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col items-center gap-1"
                      onClick={() => {
                        setAmount(value);
                      }}
                    >
                      <span className="font-semibold">
                        RWF {value.toLocaleString()}
                      </span>

                      <span className="text-xs opacity-70">
                        {((value / 1500) * 0.1).toFixed(2)} uTn
                      </span>
                    </Button>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Selected Amount
                    </span>
                    <span className="font-semibold">
                      RWF {amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">
                      Estimated uTn
                    </span>
                    <span className="font-medium">
                      {((amount / 1500) * 0.1).toFixed(2)} uTn
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  1 uTn = $10 USD value (RWF 15,000)
                </p>
              </div>
            )}

            {showUssdCode ? (
              <MobileMoneyPaymentUI
                payment={paymentId}
                user={user} // { phone, fullName } — phone is used for USSD identification
                total={amount}
                onPaymentConfirmed={(amount) => {
                  onRechargeCreated(amount);
                  setPaymentId("");
                  setShowUssdCode(false);
                }}
                onPaymentCancelled={(payment) => {
                  cancelPaymentTransaction({
                    variables: {
                      id: payment,
                    },
                  });
                  setShowUssdCode(false);
                }}
              />
            ) : (
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {rechargeMethod.includes("MONEY") && (
                  <Button
                    variant="default"
                    onClick={generateUssdCode}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Generate Code
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
