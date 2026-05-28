"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CONVERT_TO_TOKENS } from "@/graphql/wallet.gql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Coins,
  DollarSign,
  TrendingUp,
  X,
  Loader2,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (amount: number) => void;
  balance: number;
}

export default function ConvertModal({
  isOpen,
  onClose,
  onConvert,
  balance,
}: ConvertModalProps) {
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const MIN_CONVERT = 10;

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setAmount(0);
    }
  }, [isOpen]);

  const calculateTokenAmount = () => {
    if (amount <= 0) return 0;
    return amount / 10; // 1 uTn = $10
  };

  const getValidationError = () => {
    if (amount <= 0) {
      return "Amount must be greater than 0";
    }

    if (amount < MIN_CONVERT) {
      return `Minimum conversion amount is $${MIN_CONVERT}`;
    }

    if (amount > balance) {
      return `Conversion amount exceeds available balance ($${balance.toFixed(2)})`;
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
      onConvert(amount);
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
                <Coins className="h-5 w-5 text-primary" />
                Convert to Tokens
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Exchange account balance for USCOR tokens
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
                Amount to Convert
              </label>
              <Input
                id="amount"
                type="number"
                min={MIN_CONVERT}
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder={`Minimum $${MIN_CONVERT}`}
                className="h-12 text-lg font-bold"
              />
              {validationError && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {validationError}
                </p>
              )}
            </div>

            <div className="p-4 bg-muted rounded-lg border border-border">
              <h3 className="font-medium mb-3">Conversion Details</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Dollars to Convert</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate</span>
                  <span>1 uTn = $10</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Tokens to Receive</span>
                  <span className="text-primary">
                    {calculateTokenAmount().toFixed(2)} uTn
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Token Benefits</h4>
                  <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <li>
                      • Use tokens to purchase from other businesses in the
                      marketplace
                    </li>
                    <li>
                      • Tokens provide stable value regardless of currency
                      fluctuations
                    </li>
                    <li>• Convert tokens back to cash when needed</li>
                    <li>
                      • Tokens can be used for freelance services and
                      marketplace features
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
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Convert to Tokens
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
