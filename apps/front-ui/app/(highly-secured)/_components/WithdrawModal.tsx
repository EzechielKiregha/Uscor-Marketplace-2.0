"use client";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowDown, DollarSign, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, method: string) => void;
  balance: number;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  onWithdraw,
  balance,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState(0);
  const [withdrawMethod, setWithdrawMethod] = useState("MTN_MOMO");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const MIN_WITHDRAWAL = 10;
  const WITHDRAWAL_FEE = 0.02; // 2% fee

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setAmount(0);
      setPhoneNumber("");
    }
  }, [isOpen]);

  const calculateNetAmount = () => {
    if (amount <= 0) return 0;
    const fee = amount * WITHDRAWAL_FEE;
    return amount - fee;
  };

  const getValidationError = () => {
    if (amount <= 0) {
      return "Amount must be greater than 0";
    }

    if (amount < MIN_WITHDRAWAL) {
      return `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`;
    }

    if (amount > balance) {
      return `Withdrawal amount exceeds available balance ($${balance.toFixed(2)})`;
    }

    if (
      (withdrawMethod.includes("MOMO") || withdrawMethod.includes("MONEY")) &&
      !phoneNumber
    ) {
      return "Phone number is required for mobile money withdrawal";
    }

    return "";
  };

  const validationError = getValidationError();
  const isValid = !validationError;

  const handleSubmit = () => {
    if (!isValid) return;

    setIsSubmitting(true);

    // In a real app, this would call the mutation
    setTimeout(() => {
      onWithdraw(amount, withdrawMethod);
      setIsSubmitting(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ArrowDown className="h-5 w-5 text-destructive" />
                Withdraw Funds
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Transfer money from your USCOR wallet
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <span>Available Balance</span>
                <span className="font-bold text-lg">${balance.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-1 flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Amount to Withdraw
              </label>
              <Input
                id="amount"
                type="number"
                min={MIN_WITHDRAWAL}
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder={`Minimum $${MIN_WITHDRAWAL}`}
                className="h-12 text-lg font-bold"
              />
              {validationError && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {validationError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="method"
                className="block text-sm font-medium mb-1"
              >
                Withdrawal Method
              </label>
              <select
                id="method"
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="AIRTEL_MONEY" disabled>
                  Airtel Money
                </option>
                <option value="ORANGE_MONEY" disabled>
                  Orange Money
                </option>
                <option value="MPESA" disabled>
                  M-Pesa
                </option>
                <option value="BANK_TRANSFER" disabled>
                  Bank Transfer
                </option>
              </select>
            </div>

            {(withdrawMethod.includes("MOMO") ||
              withdrawMethod.includes("MONEY")) && (
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium mb-1"
                >
                  Recipient Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+250 788 123 456"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the phone number where funds will be sent
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg border border-border">
              <h3 className="font-medium mb-3">Transaction Details</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gross Amount</span>
                  <span>Frw {amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Withdrawal Fee (2%)</span>
                  <span>Frw {(amount * WITHDRAWAL_FEE).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Net Amount</span>
                  <span>Frw {calculateNetAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Important Information</h4>
                  <ul className="mt-1 space-y-1 text-sm text-warning">
                    <li>• Withdrawal fees: 2% of the withdrawal amount</li>
                    <li>• Processing time: 1-2 business days</li>
                    <li>• Minimum withdrawal: $10</li>
                    <li>
                      • Funds will be sent to the specified account within 24
                      hours
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={isSubmitting || !isValid}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
