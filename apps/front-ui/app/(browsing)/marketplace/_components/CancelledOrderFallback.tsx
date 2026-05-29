// marketplace/checkout/_components/CancelledOrderFallback.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Wallet,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const TOKEN_RATE = 10; // 1 uTn = $10

interface CancelledOrderFallbackProps {
  amount: number;
  /** Pass balance + tokenBalance from GET_ACCOUNT_BALANCE */
  balance: number;
  tokenBalance: number;
  onSelectMethod: (method: "TOKEN" | "BALANCE") => void;
}

export default function CancelledOrderFallback({
  amount,
  balance,
  tokenBalance,
  onSelectMethod,
}: CancelledOrderFallbackProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tokenRequired = amount / TOKEN_RATE;
  const hasEnoughBalance = balance >= amount;
  const hasEnoughToken = tokenBalance >= tokenRequired;
  const neitherAvailable = !hasEnoughBalance && !hasEnoughToken;

  const goToWallet = () =>
    router.push(`/client/wallet?redirect=${encodeURIComponent(pathname)}`);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-destructive/10 border-b border-destructive/20 flex items-start gap-3">
        <div className="p-1.5 rounded-md bg-destructive/10 shrink-0 mt-0.5">
          <XCircle className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-destructive">Order Cancelled</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Mobile Money payment was not completed in time. Choose an alternative to retry.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Amount */}
        <div className="flex justify-between items-center text-sm bg-muted rounded-lg px-4 py-3">
          <span className="text-muted-foreground">Amount due</span>
          <span className="font-bold">${amount.toFixed(2)}</span>
        </div>

        {/* TOKEN option */}
        <MethodRow
          icon={<CreditCard className="h-4 w-4" />}
          label="Token Payment"
          sub={`${tokenRequired.toFixed(2)} uTn required · 1 uTn = $${TOKEN_RATE}`}
          balanceLabel="Token balance"
          balanceValue={`${tokenBalance.toFixed(2)} uTn`}
          hasEnough={hasEnoughToken}
          onSelect={() => onSelectMethod("TOKEN")}
          onRecharge={goToWallet}
        />

        {/* BALANCE option */}
        <MethodRow
          icon={<Wallet className="h-4 w-4" />}
          label="Account Balance"
          sub={`$${amount.toFixed(2)} will be deducted from your wallet`}
          balanceLabel="Available balance"
          balanceValue={`$${balance.toFixed(2)}`}
          hasEnough={hasEnoughBalance}
          onSelect={() => onSelectMethod("BALANCE")}
          onRecharge={goToWallet}
        />

        {/* Both insufficient — prominent wallet CTA */}
        {neitherAvailable && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning">
                  Insufficient balance across all methods
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Top up your wallet and you'll be redirected back to this page to complete your order.
                </p>
              </div>
            </div>
            <Button
              onClick={goToWallet}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Top Up Wallet
              <ExternalLink className="h-3.5 w-3.5 ml-auto" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Row sub-component ────────────────────────────────────────────────────────

interface MethodRowProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  balanceLabel: string;
  balanceValue: string;
  hasEnough: boolean;
  onSelect: () => void;
  onRecharge: () => void;
}

function MethodRow({
  icon,
  label,
  sub,
  balanceLabel,
  balanceValue,
  hasEnough,
  onSelect,
  onRecharge,
}: MethodRowProps) {
  return (
    <div className={`border rounded-lg p-3 transition-colors ${
      hasEnough ? "border-border bg-background" : "border-border bg-muted/40 opacity-80"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1.5 rounded-md bg-muted shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </div>

        <Badge
          variant={hasEnough ? "secondary" : "destructive"}
          className={`shrink-0 text-xs ${
            hasEnough
              ? "bg-success/10 text-success border-success/20 hover:bg-success/10"
              : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10"
          }`}
        >
          {hasEnough ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {balanceValue}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">{balanceLabel}</span>
        {hasEnough ? (
          <Button
            size="sm"
            onClick={onSelect}
            className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Pay Now
            <ArrowRight className="h-3 w-3 ml-1.5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive font-medium">Insufficient</span>
            <Button
              size="sm"
              variant="outline"
              onClick={onRecharge}
              className="h-7 px-3 text-xs"
            >
              <Wallet className="h-3 w-3 mr-1" />
              Top Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
