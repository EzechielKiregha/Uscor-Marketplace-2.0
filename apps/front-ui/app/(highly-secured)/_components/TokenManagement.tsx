// app/wallet/_components/TokenManagement.tsx (Updated)
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Coins,
  Gift,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { REDEEM_TOKENS, RELEASE_TOKENS } from "@/graphql/wallet.gql";
import { useMe } from "@/lib/useMe";
import { EARN_POINTS } from "@/graphql/loyalty.gql";

interface TokenManagementProps {
  tokenBalance: any;
  onTokenRedeemed: () => void;
  onTokenReleased: () => void;
  showTokenModal?: boolean;
  setShowTokenModal?: (show: boolean) => void;
}

export default function TokenManagement({
  tokenBalance,
  onTokenRedeemed,
  onTokenReleased,
  showTokenModal = false,
  setShowTokenModal,
}: TokenManagementProps) {
  const { user } = useMe();
  const [modalType, setModalType] = useState<
    "redeem" | "release" | "earn" | null
  >("release");
  const { showToast } = useToast();
  const [amount, setAmount] = useState(0);
  const [recipientId, setRecipientId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [redeemTokens] = useMutation(REDEEM_TOKENS);
  const [releaseTokens] = useMutation(RELEASE_TOKENS);
  const [earnPoints] = useMutation(EARN_POINTS);

  useEffect(() => {
    if (!showTokenModal) {
      // Reset form when modal closes
      setAmount(0);
      setRecipientId("");
      setReason("");
      setModalType(null);
    }
  }, [showTokenModal]);

  const handleRedeem = async () => {
    if (amount <= 0 || amount > (tokenBalance?.availableTokens || 0)) {
      showToast("error", "Invalid Amount", "Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      await redeemTokens({
        variables: {
          input: {
            clientId: user?.id,
            loyaltyProgramId: tokenBalance?.loyaltyProgramId,
            points: amount,
            reason: reason || "Manual redemption",
          },
        },
      });

      showToast("success", "Success", `${amount} tokens redeemed successfully`);
      onTokenRedeemed();
      setShowTokenModal?.(false);
    } catch (error: any) {
      showToast(
        "error",
        "Redemption Failed",
        error.message || "Failed to redeem tokens",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async () => {
    if (amount <= 0 || amount > (tokenBalance?.availableTokens || 0)) {
      showToast("error", "Invalid Amount", "Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      await releaseTokens({
        variables: {
          input: {
            clientId: user?.id,
            loyaltyProgramId: tokenBalance?.loyaltyProgramId,
            points: amount,
            reason: reason || "Manual release",
          },
        },
      });

      showToast("success", "Success", `${amount} tokens released successfully`);
      onTokenReleased();
      setShowTokenModal?.(false);
    } catch (error: any) {
      showToast(
        "error",
        "Release Failed",
        error.message || "Failed to release tokens",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEarn = async () => {
    if (amount <= 0 || !recipientId) {
      showToast(
        "error",
        "Invalid Input",
        "Please enter a valid amount and recipient ID",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await earnPoints({
        variables: {
          input: {
            clientId: recipientId,
            loyaltyProgramId: tokenBalance?.loyaltyProgramId,
            points: amount,
            reason: reason || "Manual addition",
          },
        },
      });

      showToast("success", "Success", `${amount} tokens awarded successfully`);
      onTokenRedeemed(); // This triggers a refresh of token balance
      setShowTokenModal?.(false);
    } catch (error: any) {
      showToast(
        "error",
        "Award Failed",
        error.message || "Failed to award tokens",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = () => {
    switch (modalType) {
      case "redeem":
        handleRedeem();
        break;
      case "release":
        handleRelease();
        break;
      case "earn":
        handleEarn();
        break;
    }
  };

  const openModal = (type: "redeem" | "release" | "earn") => {
    setModalType(type);
    setAmount(0);
    setRecipientId("");
    setReason("");
    setShowTokenModal?.(true);
  };

  if (!showTokenModal || !modalType) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {modalType === "redeem" && (
                  <Gift className="h-5 w-5 text-success" />
                )}
                {modalType === "release" && (
                  <TrendingUp className="h-5 w-5 text-primary" />
                )}
                {modalType === "earn" && (
                  <Plus className="h-5 w-5 text-success" />
                )}
                {modalType === "redeem" && "Redeem Tokens"}
                {modalType === "release" && "Release Tokens"}
                {modalType === "earn" && "Award Tokens"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {modalType === "redeem" && "Convert tokens to cash or rewards"}
                {modalType === "release" &&
                  "Release tokens for marketplace features"}
                {modalType === "earn" && "Manually award tokens to a customer"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTokenModal?.(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {modalType === "earn" && (
              <div>
                <label
                  htmlFor="recipientId"
                  className="block text-sm font-medium mb-1 flex items-center gap-2"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Recipient Customer ID
                </label>
                <Input
                  id="recipientId"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  placeholder="Enter customer ID"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-1 flex items-center gap-2"
              >
                <Coins className="h-4 w-4 text-muted-foreground" />
                {modalType === "redeem" && "Tokens to Redeem"}
                {modalType === "release" && "Tokens to Release"}
                {modalType === "earn" && "Tokens to Award"}
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAmount(Math.max(0, amount - 10))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="amount"
                  type="number"
                  min="10"
                  max={tokenBalance?.availableTokens || 0}
                  value={amount}
                  onChange={(e) =>
                    setAmount(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="flex-1 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setAmount(
                      Math.min(tokenBalance?.availableTokens || 0, amount + 10),
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Minimum 10 tokens
              </p>
            </div>

            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium mb-1"
              >
                {modalType === "redeem" && "Reason for Redemption"}
                {modalType === "release" && "Reason for Release"}
                {modalType === "earn" && "Reason for Award"}
              </label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  modalType === "redeem"
                    ? "e.g., Cash withdrawal, Marketplace purchase..."
                    : modalType === "release"
                      ? "e.g., Repost product, Reown item..."
                      : "e.g., Bonus, Special promotion, Referral reward..."
                }
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-1">
                <span>
                  Tokens to{" "}
                  {modalType === "redeem"
                    ? "Redeem"
                    : modalType === "release"
                      ? "Release"
                      : "Award"}
                </span>
                <span>{amount}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Value</span>
                <span>${(amount * 10).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowTokenModal?.(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className={`${
                  modalType === "redeem"
                    ? "bg-success hover:bg-success/90 text-success-foreground"
                    : modalType === "release"
                      ? "bg-primary hover:bg-accent text-primary-foreground"
                      : "bg-success hover:bg-success/90 text-success-foreground"
                }`}
                onClick={handleModalSubmit}
                disabled={
                  isSubmitting ||
                  amount <= 0 ||
                  (modalType !== "earn" &&
                    amount > (tokenBalance?.availableTokens || 0)) ||
                  (modalType === "earn" && !recipientId)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {modalType === "redeem" && (
                      <Gift className="h-4 w-4 mr-2" />
                    )}
                    {modalType === "release" && (
                      <TrendingUp className="h-4 w-4 mr-2" />
                    )}
                    {modalType === "earn" && <Plus className="h-4 w-4 mr-2" />}
                    {modalType === "redeem"
                      ? "Redeem Tokens"
                      : modalType === "release"
                        ? "Release Tokens"
                        : "Award Tokens"}
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
