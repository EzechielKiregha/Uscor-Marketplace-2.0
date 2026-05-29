"use client";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CREATE_ACCOUNT_RECHARGE,
  GET_MOBILE_MONEY_CODE,
} from "@/graphql/wallet.gql";
import { useMutation } from "@apollo/client";
import {
  Copy,
  CreditCard,
  DollarSign,
  Loader2,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRechargeCreated: (recharge: any) => void;
  selectedMethod?: string | null;
  userId: string;
  userType: "client" | "business" | "worker" | "admin";
}

export default function RechargeModal({
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
    selectedMethod || "MTN_MOMO",
  );
  const { showToast } = useToast();
  const [country, setCountry] = useState("RWANDA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ussdCode, setUssdCode] = useState("");
  const [showUssdCode, setShowUssdCode] = useState(false);

  const [createRecharge] = useMutation(CREATE_ACCOUNT_RECHARGE);
  const [getMobileMoneyCode] = useMutation(GET_MOBILE_MONEY_CODE);

  useEffect(() => {
    if (selectedMethod) {
      setRechargeMethod(selectedMethod);
    }
  }, [selectedMethod]);

  const generateUssdCode = async () => {
    if (amount <= 0 || !phoneNumber) {
      showToast(
        "error",
        "Invalid Input",
        "Please enter a valid amount and phone number",
      );
      return;
    }

    try {
      const { data } = await getMobileMoneyCode({
        variables: {
          input: {
            method: rechargeMethod,
            amount,
            phoneNumber,
            country,
          },
        },
      });

      setUssdCode(data.getMobileMoneyCode.ussdCode);
      setShowUssdCode(true);
    } catch (error: any) {
      showToast(
        "error",
        "Error",
        error.message || "Failed to generate USSD code",
      );
    }
  };

  const handleRecharge = async () => {
    if (amount <= 0) {
      showToast(
        "error",
        "Invalid Amount",
        "Please enter a valid amount greater than 0",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await createRecharge({
        variables: {
          input: {
            userId,
            userType,
            amount,
            method: rechargeMethod,
            origin: country,
            phoneNumber: rechargeMethod.includes("MOMO")
              ? phoneNumber
              : undefined,
          },
        },
      });

      onRechargeCreated(data.createAccountRecharge);
      showToast(
        "success",
        "Recharge Successful",
        `Successfully added $${amount} to your account`,
      );
    } catch (error: any) {
      showToast(
        "error",
        "Recharge Failed",
        error.message || "Failed to recharge account",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ussdCode);
    showToast("success", "Copied", "USSD code copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {rechargeMethod.includes("MOMO") ||
                rechargeMethod.includes("MONEY") ? (
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
                  <option value="RWANDA">Rwanda</option>
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
                  <option value="MTN_MOMO">MTN Mobile Money</option>
                  <option value="AIRTEL_MONEY">Airtel Money</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-1 flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Amount to Recharge
              </label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="pl-9 pr-16"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {(amount * 0.1).toFixed(2)} uTn
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                1 uTn = $10 USD value
              </p>
            </div>

            {(rechargeMethod.includes("MOMO") ||
              rechargeMethod.includes("MONEY")) && (
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium mb-1"
                >
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+250 788 123 456"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter your mobile money phone number
                </p>
              </div>
            )}

            {showUssdCode && (
              <div className="p-4 bg-muted rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Payment Instructions</h3>
                  <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Dial the following code on your phone to complete the payment:
                </p>
                <div className="bg-background rounded-lg p-4 text-center">
                  <p className="text-xl font-mono font-bold text-primary">
                    {ussdCode}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This code will charge ${amount.toFixed(2)} to your account
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {rechargeMethod.includes("MOMO") ||
              rechargeMethod.includes("MONEY") ? (
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
              ) : (
                <Button
                  variant="default"
                  onClick={handleRecharge}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recharging...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Recharge Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
