// marketplace/checkout/_components/MobileMoneyPaymentCard.tsx
"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
    CheckCircle,
    Copy,
    Phone,
    RefreshCw,
    Wallet,
    XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CANCEL_PAYMENT_TRANSACTION,
    CHECK_PAYMENT_TRANSACTION_STATUS,
} from "@/graphql/payment.gql";

const COUNTDOWN_DURATION = 25 * 60; // 25 minutes

interface MobileMoneyPaymentCardProps {
  payment: string;
  user: any;
  total: number;
  onPaymentConfirmed?: (amount: number) => void;
  onPaymentCancelled?: (payment: string) => void;
}

export default function MobileMoneyPaymentUI({
  payment,
  user,
  total,
  onPaymentConfirmed,
  onPaymentCancelled,
}: MobileMoneyPaymentCardProps) {
  const storageKey = `payment_countdown_${payment}`;

  const getInitialTime = (): number => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { expiresAt } = JSON.parse(stored);
        const remaining = Math.floor((expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    } catch {
      /* ignore */
    }
    return COUNTDOWN_DURATION;
  };

  //   console.log({ payment });

  const [remainingTime, setRemainingTime] = useState<number>(getInitialTime);
  const [isPaid, setIsPaid] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const cancelledRef = useRef(false);
  const { showToast } = useToast();

  const [cancelPaymentTransaction] = useMutation(CANCEL_PAYMENT_TRANSACTION);

  // Persist expiry on first mount
  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) {
        const expiresAt = Date.now() + COUNTDOWN_DURATION * 1000;
        localStorage.setItem(storageKey, JSON.stringify({ expiresAt }));
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  // Countdown tick
  useEffect(() => {
    if (remainingTime <= 0 || isPaid) return;
    const timer = setTimeout(() => setRemainingTime((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingTime, isPaid]);

  // Auto-cancel when time runs out
  useEffect(() => {
    if (remainingTime !== 0 || isPaid || cancelledRef.current) return;
    cancelledRef.current = true;
    localStorage.removeItem(storageKey);
    cancelPaymentTransaction({ variables: { id: payment } })
      .then(() => {
        showToast(
          "error",
          "Time expired",
          "Time expired. Your Account Recharge payment has been automatically cancelled.",
          true,
          5000,
        );
        onPaymentCancelled?.(payment);
      })
      .catch(() =>
        showToast(
          "error",
          "Error",
          "Could not cancel Account Recharge payment. Please contact support",
        ),
      );
  }, [
    remainingTime,
    isPaid,
    cancelPaymentTransaction,
    onPaymentCancelled,
    storageKey,
  ]);

  const { data, refetch } = useQuery(CHECK_PAYMENT_TRANSACTION_STATUS, {
    variables: { id: payment },
    fetchPolicy: "network-only",
  });

  const paymentData = data?.checkPaymentTransactionStatus;

  // Refetch order and check payment status
  const handleCheckPayment = async () => {
    setIsPolling(true);

    try {
      await refetch();
      const status = paymentData?.status;
      if (status === "COMPLETED") {
        setIsPaid(true);
        localStorage.removeItem(storageKey);
        showToast("success", "Paid", "Payment confirmed!.", true, 5000);
        onPaymentConfirmed?.(paymentData?.amount);
      } else if (status === "FAILED") {
        localStorage.removeItem(storageKey);
        showToast(
          "error",
          "Payment Failed",
          "Payment failed or was cancelled.",
          true,
          5000,
        );
        onPaymentCancelled?.(payment);
      } else {
        showToast(
          "error",
          "No Payment",
          "Payment not received yet. Please dial the USSD code.",
          true,
          5000,
        );
      }
    } catch (error: any) {
      console.log(error?.message);
      showToast(
        "error",
        "Failed",
        "Verification failed. Please try again.",
        true,
        5000,
      );
    } finally {
      setIsPolling(false);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const isExpired = remainingTime === 0 && !isPaid;
  const progress = (remainingTime / COUNTDOWN_DURATION) * 100;
  const isUrgent = remainingTime < 60;
  const isWarning = remainingTime < 3 * 60;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold">Mobile Money Payment</h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCheckPayment}
          disabled={isPolling || isPaid || isExpired}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 mr-1.5 ${isPolling ? "animate-spin" : ""}`}
          />
          {isPolling ? "Checking..." : "Check Payment"}
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* USSD Code */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            USSD Code
          </p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary tracking-widest font-mono">
              *384*66639#
            </p>
            <button
            type="button"
              onClick={() => {
                navigator.clipboard.writeText("*384*66639#");
                showToast(
                  "success",
                  "Success",
                  "Code copied. Dial it on your phone.",
                  true,
                  5000,
                );
              }}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        {/* Merchant Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Merchant Name</p>
            <p className="font-semibold text-sm">Kambale Kiregha</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">MoMoPay ID</p>
            <p className="font-semibold text-sm">66639 (TIGer-6)</p>
          </div>
        </div>

        {/* Payer Phone — readonly from user profile */}
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Payment Phone
          </p>
          <div className="flex items-center gap-3 border border-border rounded-lg px-3 py-2.5 bg-background">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold tracking-wide flex-1">
              {user?.phone ?? "No phone on file"}
            </span>
            <Badge variant="secondary" className="text-xs shrink-0">
              Your number
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            This number is used to identify your payment automatically on our
            system.
          </p>
        </div>

        {/* Timer / Status */}
        {isPaid ? (
          <div className="flex justify-between items-center rounded-lg bg-success/10 border border-success/20 px-4 py-3">
            <span className="text-success font-medium flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" />
              Payment Confirmed
            </span>
            <span className="font-bold text-success text-sm">
              ${total.toFixed(2)}
            </span>
          </div>
        ) : isExpired ? (
          <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
            <div>
              <p className="text-destructive font-semibold text-sm">
                Time Expired — Order Cancelled
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No payment was received within the allowed window.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Countdown row */}
            <div
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                isUrgent
                  ? "bg-destructive/10 border-destructive/20"
                  : isWarning
                    ? "bg-warning/10 border-warning/20"
                    : "bg-muted border-border"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  isUrgent
                    ? "text-destructive"
                    : isWarning
                      ? "text-warning"
                      : "text-muted-foreground"
                }`}
              >
                ⏳ Complete payment before time runs out
              </span>
              <span
                className={`font-mono font-bold text-lg tabular-nums ${
                  isUrgent
                    ? "text-destructive"
                    : isWarning
                      ? "text-warning"
                      : "text-foreground"
                }`}
              >
                {formatTime(remainingTime)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isUrgent
                    ? "bg-destructive"
                    : isWarning
                      ? "bg-warning"
                      : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-center text-xs text-muted-foreground py-1">
              Waiting for payment confirmation...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
