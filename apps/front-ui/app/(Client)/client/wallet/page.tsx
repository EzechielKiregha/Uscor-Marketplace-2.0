"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart,
  Coins,
  CreditCard,
  DollarSign,
  Download,
  Gift,
  Lock,
  Plus,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import ConvertModal from "@/app/(highly-secured)/_components/ConvertModal";
import RechargeModal from "@/app/(highly-secured)/_components/RechargeModal";
import TokenManagement from "@/app/(highly-secured)/_components/TokenManagement";
import TransactionHistory from "@/app/(highly-secured)/_components/TransactionHistory";
import WithdrawModal from "@/app/(highly-secured)/_components/WithdrawModal";
import { StatusBadge } from "@/components/StatusBadge";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  CONVERT_TO_TOKENS,
  CREATE_ACCOUNT_RECHARGE,
  GET_ACCOUNT_BALANCE,
  GET_ACCOUNT_RECHARGES,
  REDEEM_TOKENS,
  RELEASE_TOKENS,
  WITHDRAW_ACCOUNT_FUNDS,
} from "@/graphql/wallet.gql";
import { useMe } from "@/lib/useMe";

export default function WalletPage() {
  const { user, role, loading: authLoading } = useMe();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "balance" | "recharges" | "tokens" | "history"
  >("balance");
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: balanceData,
    loading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery(GET_ACCOUNT_BALANCE, {
    variables: {
      userId: user?.id,
      userType: role,
    },
    skip: !user?.id || !role,
  });

  const {
    data: rechargesData,
    loading: rechargesLoading,
    error: rechargesError,
    refetch: refetchRecharges,
  } = useQuery(GET_ACCOUNT_RECHARGES, {
    variables: {
      userId: user?.id,
      userType: role,
      method: selectedMethod === "MOBILE_MONEY" ? "MTN_MONEY" : undefined,
      origin: selectedOrigin || undefined,
      search: searchQuery || undefined,
    },
    skip: !user?.id || !role,
  });

  const [createRecharge] = useMutation(CREATE_ACCOUNT_RECHARGE);
  const [withdrawFunds] = useMutation(WITHDRAW_ACCOUNT_FUNDS);
  const [convertToTokens] = useMutation(CONVERT_TO_TOKENS);
  const [redeemTokens] = useMutation(REDEEM_TOKENS);
  const [releaseTokens] = useMutation(RELEASE_TOKENS);

  const balance = balanceData?.accountBalance;
  const tokenBalance = balanceData?.accountBalance?.tokenBalance;
  const recharges = balanceData?.accountBalance?.transactions || [];
  //   const tokenTransactions = balanceData?.transactions?.items || [];

  const paymentMethods = [
    {
      id: "MTN_MONEY",
      name: "MTN Mobile Money",
      desc: "Fast and secure mobile payments",
      icon: Smartphone,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-500/10",
      status: "active",
    },
    {
      id: "AIRTEL_MONEY",
      name: "Airtel Money",
      desc: "East Africa's leading payment provider",
      icon: Smartphone,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      tatus: "next",
      badgeText: "Coming Soon",
      badgeVariant: "next" as const,
    },
    {
      id: "ORANGE_MONEY",
      name: "Orange Money",
      desc: "Coming soon to your region",
      icon: Smartphone,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      status: "next",
      badgeText: "Coming Soon",
      badgeVariant: "next" as const,
    },
    {
      id: "MPESA",
      name: "M-Pesa",
      desc: "Available for +Pro users only",
      icon: Smartphone,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
      tatus: "next",
      badgeText: "Coming Soon",
      badgeVariant: "next" as const,
    },
    {
      id: "BANK_TRANSFER",
      name: "Bank Transfer",
      desc: "Direct bank to platform transfer",
      icon: CreditCard,
      iconColor: "text-success",
      bgColor: "bg-success/10",
      tatus: "next",
      badgeText: "Coming Soon",
      badgeVariant: "next" as const,
    },
  ];

  const handleRechargeCreated = (amount: number) => {
    refetchBalance();
    refetchRecharges();
    setShowRechargeModal(false);
    showToast(
      "success",
      "Recharge Successful",
      `Successfully added $${amount} to your account`,
    );
  };

  const handleWithdrawFunds = async (amount: number, method: string) => {
    try {
      const { data } = await withdrawFunds({
        variables: {
          input: {
            userId: user?.id,
            userType: role,
            amount,
            method,
          },
        },
      });

      refetchBalance();
      showToast(
        "success",
        "Withdrawal Successful",
        `Withdrawal of $${data.withdrawFunds.netAmount} processed`,
      );
      setShowWithdrawModal(false);
    } catch (error: any) {
      showToast(
        "error",
        "Withdrawal Failed",
        error.message || "Failed to withdraw funds",
      );
    }
  };

  const handleConvertToTokens = async (amount: number) => {
    try {
      const { data } = await convertToTokens({
        variables: {
          input: {
            userId: user?.id,
            userType: role,
            amount,
          },
        },
      });

      refetchBalance();
      showToast(
        "success",
        "Conversion Successful",
        `${data.convertToTokens.tokenAmount} tokens added to your account`,
      );
      setShowConvertModal(false);
    } catch (error: any) {
      showToast(
        "error",
        "Conversion Failed",
        error.message || "Failed to convert to tokens",
      );
    }
  };

  if (authLoading || balanceLoading) return <DashboardSkeleton showChart={false} />;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Wallet Access Required</h1>
          <p className="text-muted-foreground mt-2">
            You need to be logged in to access your wallet
          </p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => {
              const currentPath = encodeURIComponent(window.location.pathname);
              window.location.href = `/login?redirect=${currentPath}`;
            }}
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-page-title">Wallet & Token Management</h1>
          <p className="text-page-subtitle">
            Manage your account balance and USCOR tokens
          </p>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-card border border-border rounded-lg p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-stat-label">Total Balance</p>
                <p className="text-stat">
                  Frw {balance?.totalAmount?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span className="font-medium">
                  Frw {balance?.availableAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="font-medium">
                  Frw {balance?.pendingAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Reserved</span>
                <span className="font-medium">
                  Frw {balance?.reservedAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-stat-label">
                  USCOR Tokens (uTn)
                </p>
                <p className="text-stat">
                  {tokenBalance?.totalTokens || 0}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span className="font-medium">
                  {tokenBalance?.availableTokens || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="font-medium">
                  {tokenBalance?.pendingTokens || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Value</span>
                <span className="font-medium">
                  ${(tokenBalance?.totalTokens * 10).toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-stat-label">
                  Token Conversion
                </p>
                <p className="text-stat">1 uTn = $10</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowConvertModal(true)}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Convert to Tokens
              </Button>
              {/* <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowTokenModal(true)}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Token Management
              </Button> */}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => setShowRechargeModal(true)}
          >
            <Plus className="h-4 w-4" />
            Recharge Account
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowWithdrawModal(true)}
          >
            <ArrowDown className="h-4 w-4" />
            Withdraw Funds
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowConvertModal(true)}
          >
            <TrendingUp className="h-4 w-4" />
            Convert to Tokens
          </Button>

          {/* <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowTokenModal(true)}
          >
            <Coins className="h-4 w-4" />
            Token Management
          </Button> */}

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Transactions
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeTab === "balance" ? "default" : "outline"}
              onClick={() => setActiveTab("balance")}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Balance Overview
            </Button>
            <Button
              variant={activeTab === "recharges" ? "default" : "outline"}
              onClick={() => setActiveTab("recharges")}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Recharge History
            </Button>
            {/* <Button
              variant={activeTab === "tokens" ? "default" : "outline"}
              onClick={() => setActiveTab("tokens")}
              className="flex items-center gap-2"
            >
              <Coins className="h-4 w-4" />
              Token Transactions
            </Button> */}
            <Button
              variant={activeTab === "history" ? "default" : "outline"}
              onClick={() => setActiveTab("history")}
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              Transaction History
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === "balance" && (
            <div className="space-y-6">
              {/* Recharge Methods */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h2 className="font-semibold">Recharge Methods</h2>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {paymentMethods.map((method) => {
                      const isDisabled = method.status !== "active";
                      const IconComponent = method.icon;

                      return (
                        <div
                          key={method.id}
                          className={`relative border rounded-lg p-4 transition-all duration-200 ${
                            isDisabled
                              ? "border-border/50 bg-muted/20 cursor-not-allowed opacity-70"
                              : "border-border hover:bg-muted/50 hover:border-orange-500/40 cursor-pointer shadow-sm hover:shadow-md"
                          }`}
                          onClick={() => {
                            if (isDisabled) {
                              // Optional: Show a toast explaining why it's disabled
                              // showToast("info", "Unavailable", `${method.name} is currently ${method.status === 'pro' ? 'restricted to Pro users' : 'in development'}.`);
                              return;
                            }
                            setSelectedMethod(method.id);
                            setShowRechargeModal(true);
                          }}
                        >
                          {/* Reusable Badge */}
                          {method.badgeText && (
                            <StatusBadge
                              text={method.badgeText}
                              variant={method.badgeVariant}
                            />
                          )}

                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-200 ${
                                isDisabled ? "" : "group-hover:scale-110"
                              } ${method.bgColor}`}
                            >
                              <IconComponent
                                className={`h-6 w-6 ${method.iconColor}`}
                              />
                              {method.status === "pro" && isDisabled && (
                                <Lock className="h-3 w-3 absolute -bottom-1 -right-1 bg-background border border-border rounded-full p-0.5" />
                              )}
                            </div>

                            <h3 className="font-medium text-foreground">
                              {method.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                              {method.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Token Management */}
              <TokenManagement
                tokenBalance={tokenBalance}
                onTokenRedeemed={() => {}}
                onTokenReleased={() => {}}
              />

              {/* East Africa Payment Information */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h2 className="font-semibold">East Africa Payment Guide</h2>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">
                        Mobile Money Recharge Process
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        To recharge your account via mobile money:
                      </p>
                      <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                        <li>Click on your preferred mobile money provider</li>
                        <li>Enter the amount you wish to recharge</li>
                        <li>
                          Follow the instructions to complete the payment on
                          your phone
                        </li>
                        <li>
                          Your account will be credited within 1-2 minutes
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">
                      Token Conversion Benefits
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 1 uTn = $10 USD value</li>
                      <li>
                        • Use tokens to purchase from other businesses in the
                        marketplace
                      </li>
                      <li>• Convert tokens back to cash when needed</li>
                      <li>
                        • Tokens provide a stable value regardless of currency
                        fluctuations
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "recharges" && (
            <TransactionHistory
              transactions={recharges}
              loading={rechargesLoading}
              userType={role!}
              userId={user.id}
            />
          )}

          {/* {activeTab === "tokens" && (
            <div>
              <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
                  <h2 className="font-semibold">Token Transactions</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchTokenTransactions()}
                  >
                    Refresh
                  </Button>
                </div>

                <div className="p-4">
                  {tokenTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No token transactions yet
                      </h3>
                      <p className="text-muted-foreground">
                        Your token transactions will appear here after
                        conversions or redemptions
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border text-left text-sm text-muted-foreground">
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Related Product</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tokenTransactions.map((transaction: any) => (
                            <tr
                              key={transaction.id}
                              className="border-b border-border hover:bg-muted/50"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {transaction.type === "CONVERSION" && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <TrendingUp className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                  {transaction.type === "REDEMPTION" && (
                                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                      <Gift className="h-4 w-4 text-success" />
                                    </div>
                                  )}
                                  <span className="capitalize">
                                    {transaction.type.toLowerCase()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium">
                                  {transaction.amount} uTn
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {transaction.reOwnedProduct ? (
                                  <span>
                                    {transaction.reOwnedProduct.title}
                                  </span>
                                ) : transaction.repostedProduct ? (
                                  <span>
                                    {transaction.repostedProduct.title}
                                  </span>
                                ) : (
                                  <span>N/A</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  {transaction.isRedeemed && (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  )}
                                  {transaction.isReleased && (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  )}
                                  <span>
                                    {transaction.isRedeemed
                                      ? "Redeemed"
                                      : transaction.isReleased
                                        ? "Released"
                                        : "Pending"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(
                                  transaction.createdAt,
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowTokenModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Manage Tokens
                </Button>
              </div>
            </div>
          )} */}

          {activeTab === "history" && (
            <TransactionHistory
              transactions={recharges}
              loading={rechargesLoading}
              userType={role!}
              userId={user.id}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <RechargeModal
        user={user}
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onRechargeCreated={handleRechargeCreated}
        selectedMethod={selectedMethod}
        userId={user.id}
        userType={role!}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdrawFunds}
        balance={balance?.availableAmount || 0}
      />

      <ConvertModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConvert={handleConvertToTokens}
        balance={balance?.availableAmount || 0}
      />

      {/* <TokenManagement
        tokenBalance={tokenBalance}
        onTokenRedeemed={refetchTokenBalance}
        onTokenReleased={refetchTokenBalance}
        showTokenModal={showTokenModal}
        setShowTokenModal={setShowTokenModal}
      /> */}
    </div>
  );
}
