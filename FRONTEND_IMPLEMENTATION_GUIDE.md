# Frontend Implementation Guide - Wallet Operations

## Overview
This guide provides step-by-step implementation details for integrating the 3 new wallet operations on the frontend (Next.js + Apollo Client).

---

## 1. Update GraphQL Queries/Mutations

### 1.1 Add Missing Input Types to wallet.gql.ts

**File:** `apps/front-ui/graphql/wallet.gql.ts`

Add these input type definitions at the beginning (after imports):

```typescript
// ======================
// INPUT TYPES
// ======================

export const WITHDRAW_FUNDS_INPUT = gql`
  input WithdrawFundsInput {
    userId: String!
    userType: String!
    amount: Float!
    method: String
    bankAccount: String
    phoneNumber: String
    reason: String
  }
`;

export const CONVERT_TO_TOKENS_INPUT = gql`
  input ConvertToTokensInput {
    businessId: String!
    amount: Float!
    description: String
  }
`;

export const GET_MOBILE_MONEY_CODE_INPUT = gql`
  input GetMobileMoneyCodeInput {
    amount: Float!
    phoneNumber: String!
    provider: String!
    country: String
  }
`;
```

### 1.2 Add Response Fragment Types

Add these before the MUTATIONS section:

```typescript
// ======================
// RESPONSE FRAGMENTS
// ======================

export const WITHDRAWAL_RESPONSE_ENTITY = gql`
  fragment WithdrawalResponse on WithdrawalResponseEntity {
    success
    transactionId
    amount
    withdrawalFee
    netAmount
    status
    message
    createdAt
    referenceNumber
    estimatedArrivalTime
  }
`;

export const TOKEN_CONVERSION_RESPONSE_ENTITY = gql`
  fragment TokenConversionResponse on TokenConversionResponseEntity {
    success
    transactionId
    fundsAmount
    tokenAmount
    exchangeRate
    conversionFee
    status
    createdAt
    message
  }
`;

export const MOBILE_MONEY_CODE_ENTITY = gql`
  fragment MobileMoneyCode on MobileMoneyCodeEntity {
    ussdCode
    phoneNumber
    amount
    provider
    expiresIn
    instructions
    requestId
  }
`;
```

### 1.3 Update/Add Mutation Queries

**Replace** the existing WITHDRAW_ACCOUNT_FUNDS, CONVERT_TO_TOKENS, and GET_MOBILE_MONEY_CODE:

```typescript
// Replace existing or update if present
export const WITHDRAW_ACCOUNT_FUNDS = gql`
  mutation WithdrawAccountFunds($input: WithdrawFundsInput!) {
    withdrawAccountFunds(input: $input) {
      ...WithdrawalResponse
    }
  }
  ${WITHDRAWAL_RESPONSE_ENTITY}
`;

export const CONVERT_TO_TOKENS = gql`
  mutation ConvertToTokens($input: ConvertToTokensInput!) {
    convertToTokens(input: $input) {
      ...TokenConversionResponse
    }
  }
  ${TOKEN_CONVERSION_RESPONSE_ENTITY}
`;

export const GET_MOBILE_MONEY_CODE = gql`
  mutation GetMobileMoneyCode($input: GetMobileMoneyCodeInput!) {
    getMobileMoneyCode(input: $input) {
      ...MobileMoneyCode
    }
  }
  ${MOBILE_MONEY_CODE_ENTITY}
`;
```

---

## 2. Create Custom Hooks

### 2.1 useWithdrawFunds Hook

**File:** `apps/front-ui/hooks/useWithdrawFunds.ts`

```typescript
import { useMutation } from '@apollo/client';
import { WITHDRAW_ACCOUNT_FUNDS, GET_ACCOUNT_BALANCE } from '@/graphql/wallet.gql';
import { useCallback } from 'react';

interface WithdrawFundsInput {
  userId: string;
  userType: string;
  amount: number;
  method?: string;
  bankAccount?: string;
  phoneNumber?: string;
  reason?: string;
}

interface WithdrawalResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  withdrawalFee: number;
  netAmount: number;
  status: string;
  message?: string;
  createdAt: string;
  referenceNumber?: string;
  estimatedArrivalTime?: number;
}

export const useWithdrawFunds = () => {
  const [withdrawMutation, { loading, error, data }] = useMutation(
    WITHDRAW_ACCOUNT_FUNDS,
    {
      refetchQueries: [
        {
          query: GET_ACCOUNT_BALANCE,
          variables: {
            // Variables will be provided by calling component
          },
        },
      ],
      awaitRefetchQueries: true,
    }
  );

  const withdraw = useCallback(
    async (input: WithdrawFundsInput) => {
      try {
        const result = await withdrawMutation({
          variables: { input },
        });

        return {
          success: result.data.withdrawAccountFunds.success,
          data: result.data.withdrawAccountFunds as WithdrawalResponse,
          error: null,
        };
      } catch (err) {
        return {
          success: false,
          data: null,
          error: err instanceof Error ? err.message : 'Withdrawal failed',
        };
      }
    },
    [withdrawMutation]
  );

  return {
    withdraw,
    loading,
    error: error?.message,
    data: data?.withdrawAccountFunds,
  };
};
```

### 2.2 useConvertToTokens Hook

**File:** `apps/front-ui/hooks/useConvertToTokens.ts`

```typescript
import { useMutation } from '@apollo/client';
import { CONVERT_TO_TOKENS, GET_TOKEN_BALANCE, GET_ACCOUNT_BALANCE } from '@/graphql/wallet.gql';
import { useCallback } from 'react';

interface ConvertToTokensInput {
  businessId: string;
  amount: number;
  description?: string;
}

interface TokenConversionResponse {
  success: boolean;
  transactionId: string;
  fundsAmount: number;
  tokenAmount: number;
  exchangeRate: number;
  conversionFee?: number;
  status: string;
  createdAt: string;
  message?: string;
}

export const useConvertToTokens = (businessId: string) => {
  const [convertMutation, { loading, error, data }] = useMutation(
    CONVERT_TO_TOKENS,
    {
      refetchQueries: [
        {
          query: GET_TOKEN_BALANCE,
          variables: { businessId },
        },
        {
          query: GET_ACCOUNT_BALANCE,
          variables: {
            userId: businessId,
            userType: 'business',
          },
        },
      ],
      awaitRefetchQueries: true,
    }
  );

  const convert = useCallback(
    async (input: ConvertToTokensInput) => {
      try {
        const result = await convertMutation({
          variables: { input },
        });

        return {
          success: result.data.convertToTokens.success,
          data: result.data.convertToTokens as TokenConversionResponse,
          error: null,
        };
      } catch (err) {
        return {
          success: false,
          data: null,
          error: err instanceof Error ? err.message : 'Conversion failed',
        };
      }
    },
    [convertMutation]
  );

  return {
    convert,
    loading,
    error: error?.message,
    data: data?.convertToTokens,
  };
};
```

### 2.3 useGetMobileMoneyCode Hook

**File:** `apps/front-ui/hooks/useGetMobileMoneyCode.ts`

```typescript
import { useMutation } from '@apollo/client';
import { GET_MOBILE_MONEY_CODE } from '@/graphql/wallet.gql';
import { useCallback } from 'react';

interface GetMobileMoneyCodeInput {
  amount: number;
  phoneNumber: string;
  provider: string;
  country?: string;
}

interface MobileMoneyCode {
  ussdCode: string;
  phoneNumber: string;
  amount: number;
  provider: string;
  expiresIn: number;
  instructions?: string;
  requestId?: string;
}

export const useGetMobileMoneyCode = () => {
  const [getCodeMutation, { loading, error, data }] = useMutation(
    GET_MOBILE_MONEY_CODE
  );

  const getCode = useCallback(
    async (input: GetMobileMoneyCodeInput) => {
      try {
        const result = await getCodeMutation({
          variables: { input },
        });

        return {
          success: true,
          data: result.data.getMobileMoneyCode as MobileMoneyCode,
          error: null,
        };
      } catch (err) {
        return {
          success: false,
          data: null,
          error: err instanceof Error ? err.message : 'Failed to generate USSD code',
        };
      }
    },
    [getCodeMutation]
  );

  return {
    getCode,
    loading,
    error: error?.message,
    data: data?.getMobileMoneyCode,
  };
};
```

---

## 3. Create Wallet Components

### 3.1 WithdrawFundsDialog Component

**File:** `apps/front-ui/components/wallet/WithdrawFundsDialog.tsx`

```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWithdrawFunds } from '@/hooks/useWithdrawFunds';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WithdrawFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userType: string;
  availableBalance: number;
}

export const WithdrawFundsDialog: React.FC<WithdrawFundsDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userType,
  availableBalance,
}) => {
  const { toast } = useToast();
  const { withdraw, loading } = useWithdrawFunds();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [reason, setReason] = useState('');

  const handleWithdraw = async () => {
    if (!amount || !method) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (numAmount > availableBalance) {
      toast({
        title: 'Error',
        description: 'Insufficient funds',
        variant: 'destructive',
      });
      return;
    }

    const result = await withdraw({
      userId,
      userType,
      amount: numAmount,
      method,
      bankAccount: method === 'BANK_TRANSFER' ? bankAccount : undefined,
      reason,
    });

    if (result.success) {
      toast({
        title: 'Success',
        description: `Withdrawal of ${numAmount} processed. Fee: ${result.data?.withdrawalFee}`,
      });
      onOpenChange(false);
      // Reset form
      setAmount('');
      setMethod('');
      setBankAccount('');
      setReason('');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Withdrawal failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Available Balance: {availableBalance.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Withdrawal Method */}
          <div>
            <Label htmlFor="method">Withdrawal Method</Label>
            <Select value={method} onValueChange={setMethod} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bank Account (conditional) */}
          {method === 'BANK_TRANSFER' && (
            <div>
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Input
                id="bankAccount"
                placeholder="Enter account number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Reason (optional) */}
          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              placeholder="Reason for withdrawal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 3.2 ConvertToTokensDialog Component

**File:** `apps/front-ui/components/wallet/ConvertToTokensDialog.tsx`

```typescript
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConvertToTokens } from '@/hooks/useConvertToTokens';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConvertToTokensDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  availableBalance: number;
  exchangeRate: number; // funds per token
}

export const ConvertToTokensDialog: React.FC<ConvertToTokensDialogProps> = ({
  open,
  onOpenChange,
  businessId,
  availableBalance,
  exchangeRate,
}) => {
  const { toast } = useToast();
  const { convert, loading } = useConvertToTokens(businessId);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Calculate estimated tokens
  const estimatedTokens = useMemo(() => {
    if (!amount) return 0;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    // Assuming 1% fee
    const afterFee = numAmount * 0.99;
    return Math.floor(afterFee / exchangeRate);
  }, [amount, exchangeRate]);

  const handleConvert = async () => {
    if (!amount) {
      toast({
        title: 'Error',
        description: 'Please enter an amount',
        variant: 'destructive',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (numAmount > availableBalance) {
      toast({
        title: 'Error',
        description: 'Insufficient funds',
        variant: 'destructive',
      });
      return;
    }

    const result = await convert({
      businessId,
      amount: numAmount,
      description,
    });

    if (result.success) {
      toast({
        title: 'Success',
        description: `Converted ${numAmount} to ${result.data?.tokenAmount} tokens`,
      });
      onOpenChange(false);
      setAmount('');
      setDescription('');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Conversion failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to Tokens</DialogTitle>
          <DialogDescription>
            Available Balance: {availableBalance.toLocaleString()} | 
            Exchange Rate: 1 token = {exchangeRate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">Amount to Convert</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Estimated Tokens Display */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Estimated tokens: <strong>{estimatedTokens}</strong> (includes 1% fee)
            </AlertDescription>
          </Alert>

          {/* Description (optional) */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Reason for conversion"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleConvert} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 3.3 MobileMoneyPaymentDialog Component

**File:** `apps/front-ui/components/wallet/MobileMoneyPaymentDialog.tsx`

```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetMobileMoneyCode } from '@/hooks/useGetMobileMoneyCode';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface MobileMoneyPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: number;
}

export const MobileMoneyPaymentDialog: React.FC<MobileMoneyPaymentDialogProps> = ({
  open,
  onOpenChange,
  defaultAmount = 0,
}) => {
  const { toast } = useToast();
  const { getCode, loading, data } = useGetMobileMoneyCode();

  const [amount, setAmount] = useState(defaultAmount.toString());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    if (!amount || !phoneNumber || !provider) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    const result = await getCode({
      amount: numAmount,
      phoneNumber,
      provider,
    });

    if (!result.success) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleCopyUSSD = () => {
    if (data?.ussdCode) {
      navigator.clipboard.writeText(data.ussdCode);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'USSD code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mobile Money Payment</DialogTitle>
          <DialogDescription>
            Get your USSD code to complete the payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!data ? (
            <>
              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+250..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Provider Selection */}
              <div>
                <Label htmlFor="provider">Mobile Money Provider</Label>
                <Select value={provider} onValueChange={setProvider} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN_MONEY">MTN Money</SelectItem>
                    <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
                    <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                    <SelectItem value="MPESA">M-Pesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button onClick={handleGenerateCode} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate USSD Code'
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Success State */}
              <Alert className="border-green-600 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  USSD code generated successfully!
                </AlertDescription>
              </Alert>

              {/* USSD Code Display */}
              <div className="space-y-2">
                <Label>USSD Code</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-gray-100 rounded font-mono text-lg font-bold">
                    {data.ussdCode}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUSSD}
                    className={cn(
                      'transition-colors',
                      copied && 'bg-green-100 text-green-700'
                    )}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              {data.instructions && (
                <Alert>
                  <AlertDescription>{data.instructions}</AlertDescription>
                </Alert>
              )}

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold">{data.amount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold">{data.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Provider</p>
                  <p className="font-semibold">{data.provider}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expires In</p>
                  <p className="font-semibold">{data.expiresIn} seconds</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    setAmount('');
                    setPhoneNumber('');
                    setProvider('');
                  }}
                >
                  Done
                </Button>
                <Button onClick={handleGenerateCode}>Generate New Code</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 4. Update Wallet Dashboard Component

**File:** `apps/front-ui/components/wallet/WalletDashboard.tsx`

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithdrawFundsDialog } from './WithdrawFundsDialog';
import { ConvertToTokensDialog } from './ConvertToTokensDialog';
import { MobileMoneyPaymentDialog } from './MobileMoneyPaymentDialog';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_BALANCE, GET_TOKEN_BALANCE } from '@/graphql/wallet.gql';
import { ArrowUpRight, Coins, Download, QrCode } from 'lucide-react';

interface WalletDashboardProps {
  userId: string;
  userType: string;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ userId, userType }) => {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showMobilePayment, setShowMobilePayment] = useState(false);

  // For businesses, get token balance
  const tokenBalanceVariables = userType === 'business' ? { businessId: userId } : null;

  const { data: balanceData } = useQuery(GET_ACCOUNT_BALANCE, {
    variables: { userId, userType },
  });

  const { data: tokenData } = useQuery(GET_TOKEN_BALANCE, {
    variables: tokenBalanceVariables,
    skip: !tokenBalanceVariables,
  });

  const accountBalance = balanceData?.accountBalance;
  const tokenBalance = tokenData?.tokenBalance;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Account Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {accountBalance?.totalAmount?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-gray-600">
            Available: {accountBalance?.availableAmount?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-gray-600">
            Pending: {accountBalance?.pendingAmount?.toLocaleString() || '0'}
          </p>
        </CardContent>
      </Card>

      {/* Token Balance Card (Businesses only) */}
      {userType === 'business' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Coins className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tokenBalance?.totalTokens?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-600">
              Available: {tokenBalance?.availableTokens?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-600">
              Pending: {tokenBalance?.pendingTokens?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMobilePayment(true)}
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              Pay via USSD
            </Button>

            {userType === 'business' && (
              <Button
                variant="outline"
                onClick={() => setShowConvert(true)}
                className="gap-2"
              >
                <Coins className="h-4 w-4" />
                Convert to Tokens
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowWithdraw(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Withdraw Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <WithdrawFundsDialog
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        userId={userId}
        userType={userType}
        availableBalance={accountBalance?.availableAmount || 0}
      />

      {userType === 'business' && (
        <ConvertToTokensDialog
          open={showConvert}
          onOpenChange={setShowConvert}
          businessId={userId}
          availableBalance={accountBalance?.availableAmount || 0}
          exchangeRate={100} // Should come from backend config
        />
      )}

      <MobileMoneyPaymentDialog
        open={showMobilePayment}
        onOpenChange={setShowMobilePayment}
      />
    </div>
  );
};
```

---

## 5. Update Apollo Client Cache

### 5.1 Cache Configuration

**File:** `apps/front-ui/lib/apolloClient.ts` (or your Apollo client setup)

```typescript
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Account Balance caching
        accountBalance: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        // Token Balance caching
        tokenBalance: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        // Account Recharges with pagination
        accountRecharges: {
          keyArgs: ['userId', 'userType', 'method', 'status', 'origin'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            const { page = 1 } = args || {};
            if (page === 1) return incoming; // First page replaces
            // Otherwise append items
            return {
              ...incoming,
              items: [...(existing.items || []), ...incoming.items],
            };
          },
        },
        // Token Transactions with pagination
        tokenTransactions: {
          keyArgs: ['businessId', 'type', 'isRedeemed', 'isReleased'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            const { page = 1 } = args || {};
            if (page === 1) return incoming;
            return {
              ...incoming,
              items: [...(existing.items || []), ...incoming.items],
            };
          },
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link, // Your HTTP + WS link setup
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

---

## 6. Error Handling Wrapper

**File:** `apps/front-ui/components/wallet/WalletErrorBoundary.tsx`

```typescript
import React, { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface WalletErrorBoundaryProps {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WalletErrorBoundary extends React.Component<WalletErrorBoundaryProps, State> {
  constructor(props: WalletErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Wallet error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wallet Error</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An error occurred in the wallet'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. Types Definition File

**File:** `apps/front-ui/types/wallet.ts`

```typescript
export interface WalletBalance {
  totalAmount: number;
  availableAmount: number;
  pendingAmount: number;
  reservedAmount: number;
}

export interface TokenBalance {
  totalTokens: number;
  availableTokens: number;
  pendingTokens: number;
  reservedTokens: number;
}

export interface WithdrawalResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  withdrawalFee: number;
  netAmount: number;
  status: string;
  message?: string;
  createdAt: string;
  referenceNumber?: string;
  estimatedArrivalTime?: number;
}

export interface TokenConversionResponse {
  success: boolean;
  transactionId: string;
  fundsAmount: number;
  tokenAmount: number;
  exchangeRate: number;
  conversionFee?: number;
  status: string;
  createdAt: string;
  message?: string;
}

export interface MobileMoneyCode {
  ussdCode: string;
  phoneNumber: string;
  amount: number;
  provider: string;
  expiresIn: number;
  instructions?: string;
  requestId?: string;
}
```

---

## 8. Integration Example

**File:** `apps/front-ui/app/(Client)/wallet/page.tsx`

```typescript
'use client';

import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { WalletErrorBoundary } from '@/components/wallet/WalletErrorBoundary';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

export default function WalletPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <WalletErrorBoundary>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">My Wallet</h1>
        <WalletDashboard userId={user.id} userType={user.role} />
      </div>
    </WalletErrorBoundary>
  );
}
```

---

## 9. Testing Checklist

- [ ] Withdrawal form validation
- [ ] Token conversion calculations
- [ ] USSD code generation display
- [ ] Error message handling
- [ ] Loading states
- [ ] Cache invalidation after mutations
- [ ] Authorization checks (user can only access own wallet)
- [ ] Mobile responsiveness
- [ ] Accessibility compliance
- [ ] E2E tests for complete flows

---

## 10. Deployment Checklist

- [ ] GraphQL queries finalized and tested
- [ ] Hooks implemented and tested
- [ ] Components integrated into pages
- [ ] Environment variables configured
- [ ] Error logging configured
- [ ] Analytics events added
- [ ] Staging environment tested
- [ ] Performance optimized (lazy loading, pagination)
- [ ] Security review completed
- [ ] Documentation updated

---

Generated: June 2, 2026
Status: Ready for Integration
