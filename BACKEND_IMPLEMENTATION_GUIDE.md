# Backend Implementation Guide - Wallet Operations

## Overview
This guide provides step-by-step implementation details for the 3 missing wallet operations that need to be added to the backend.

---

## 1. WITHDRAW_ACCOUNT_FUNDS Implementation

### 1.1 Create Input DTO

**File:** `apps/back-api/src/account-recharge/dto/withdraw-funds.input.ts`

```typescript
import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

@InputType()
export class WithdrawFundsInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  userType: string; // 'business' or 'client'

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  method?: string; // 'BANK_TRANSFER', 'MOBILE_MONEY', etc.

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bankAccount?: string; // For bank transfers

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string; // For mobile money

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  reason?: string; // Optional withdrawal reason
}
```

### 1.2 Create Response Entity

**File:** `apps/back-api/src/account-recharge/entities/withdrawal-response.entity.ts`

```typescript
import { ObjectType, Field, Float, Boolean } from '@nestjs/graphql';

@ObjectType()
export class WithdrawalResponseEntity {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  transactionId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  withdrawalFee: number;

  @Field(() => Float)
  netAmount: number;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => String, { nullable: true })
  referenceNumber?: string;

  @Field(() => Float, { nullable: true })
  estimatedArrivalTime?: number; // in minutes
}
```

### 1.3 Add Service Method

**File:** `apps/back-api/src/account-recharge/account-recharge.service.ts`

```typescript
// Add to AccountRechargeService class

async withdraw(
  withdrawFundsInput: WithdrawFundsInput,
  userId: string,
  userRole: string,
): Promise<WithdrawalResponseEntity> {
  const { amount, method, userType } = withdrawFundsInput;

  // Validation: User can only withdraw their own funds
  if (userId !== withdrawFundsInput.userId || userRole !== userType.toLowerCase()) {
    throw new Error('Unauthorized: You can only withdraw your own funds');
  }

  // Get current balance
  const balance = await this.getBalance(userId, userRole);
  
  // Validate sufficient funds
  if (balance.availableAmount < amount) {
    throw new Error(
      `Insufficient funds. Available: ${balance.availableAmount}, Requested: ${amount}`
    );
  }

  // Calculate withdrawal fee (Example: 2.5% or minimum fee)
  const withdrawalFee = Math.max(amount * 0.025, 100); // 2.5% or min 100
  const netAmount = amount - withdrawalFee;

  // Create withdrawal transaction
  const withdrawalTransaction = await this.prisma.accountRecharge.create({
    data: {
      amount: -amount, // Negative to indicate debit
      method: method as any || RechargeMethod.MTN_MONEY,
      origin: Country.RWANDA, // Update based on user's country
      ...(userRole === 'client' && { client: { connect: { id: userId } } }),
      ...(userRole === 'business' && { business: { connect: { id: userId } } }),
      status: PaymentStatus.PENDING,
      transactionDate: new Date(),
    },
  });

  // TODO: Integrate with payment gateway to process actual withdrawal
  // This would be: paymentGateway.processWithdrawal({
  //   amount: netAmount,
  //   method,
  //   recipient: bankAccount || phoneNumber,
  // })

  // For now, update status to COMPLETED after transaction creation
  const completedTransaction = await this.prisma.accountRecharge.update({
    where: { id: withdrawalTransaction.id },
    data: { status: PaymentStatus.COMPLETED },
  });

  return {
    success: true,
    transactionId: completedTransaction.id,
    amount,
    withdrawalFee,
    netAmount,
    status: 'COMPLETED',
    message: `Withdrawal of ${amount} processed. Fee: ${withdrawalFee}`,
    createdAt: completedTransaction.createdAt,
    referenceNumber: `WD-${withdrawalTransaction.id.slice(0, 8).toUpperCase()}`,
    estimatedArrivalTime: 30, // in minutes, depends on method
  };
}
```

### 1.4 Add Resolver Method

**File:** `apps/back-api/src/account-recharge/account-recharge.resolver.ts`

```typescript
// Add to AccountRechargeResolver class

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("business", "client")
@Mutation(() => WithdrawalResponseEntity, {
  description: "Withdraws funds from account balance.",
})
async withdrawAccountFunds(
  @Args("input") withdrawFundsInput: WithdrawFundsInput,
  @Context() context,
) {
  const user = context.req.user;
  const result = await this.accountRechargeService.withdraw(
    withdrawFundsInput,
    user.id,
    user.role,
  );

  // Publish balance update event
  const updatedBalance = await this.accountRechargeService.getBalance(
    user.id,
    user.role,
  );
  await this.pubSub.publish("ACCOUNT_BALANCE_UPDATED", {
    userId: user.id,
    accountBalanceUpdated: updatedBalance,
  });

  return result;
}
```

---

## 2. CONVERT_TO_TOKENS Implementation

### 2.1 Create Input DTO

**File:** `apps/back-api/src/token-transaction/dto/convert-to-tokens.input.ts`

```typescript
import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

@InputType()
export class ConvertToTokensInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  businessId: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number; // Amount in funds to convert

  @Field(() => String, { nullable: true })
  description?: string; // Optional reason for conversion
}
```

### 2.2 Create Response Entity

**File:** `apps/back-api/src/token-transaction/entities/token-conversion-response.entity.ts`

```typescript
import { ObjectType, Field, Float, Boolean } from '@nestjs/graphql';

@ObjectType()
export class TokenConversionResponseEntity {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  transactionId: string;

  @Field(() => Float)
  fundsAmount: number;

  @Field(() => Float)
  tokenAmount: number;

  @Field(() => Float)
  exchangeRate: number; // Funds per token

  @Field(() => Float, { nullable: true })
  conversionFee?: number;

  @Field(() => String)
  status: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => String, { nullable: true })
  message?: string;
}
```

### 2.3 Create Exchange Rate Service

**File:** `apps/back-api/src/token-transaction/services/token-exchange-rate.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenExchangeRateService {
  // Cache exchange rate with TTL
  private exchangeRateCache: {
    rate: number;
    timestamp: Date;
  } | null = null;

  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private configService: ConfigService) {}

  /**
   * Get current exchange rate (funds per token)
   * Default: 1 token = 100 currency units
   */
  async getExchangeRate(): Promise<number> {
    // Check cache
    if (this.exchangeRateCache) {
      const age = Date.now() - this.exchangeRateCache.timestamp.getTime();
      if (age < this.CACHE_TTL_MS) {
        return this.exchangeRateCache.rate;
      }
    }

    // TODO: Integrate with external API if needed
    // For now, use configured rate
    const rate = this.configService.get<number>('TOKEN_EXCHANGE_RATE', 100);

    this.exchangeRateCache = {
      rate,
      timestamp: new Date(),
    };

    return rate;
  }

  /**
   * Convert funds to tokens
   */
  async convertFundsToTokens(fundsAmount: number): Promise<{
    tokenAmount: number;
    exchangeRate: number;
    fee: number;
  }> {
    const exchangeRate = await this.getExchangeRate();

    // Calculate conversion fee (1% or minimum 10 tokens)
    const fee = Math.max(fundsAmount * 0.01, 10);

    // Calculate tokens (after fee)
    const tokenAmount = (fundsAmount - fee) / exchangeRate;

    return {
      tokenAmount,
      exchangeRate,
      fee,
    };
  }
}
```

### 2.4 Add Service Method

**File:** `apps/back-api/src/token-transaction/token-transaction.service.ts`

```typescript
// Add to TokenTransactionService class

async convertFundsToTokens(
  convertToTokensInput: ConvertToTokensInput,
  businessId: string,
): Promise<TokenConversionResponseEntity> {
  const { amount, description } = convertToTokensInput;

  // Validate business exists
  const business = await this.prisma.business.findUnique({
    where: { id: businessId },
  });
  if (!business) {
    throw new Error('Business not found');
  }

  // Get current balance
  const accountRechargeService = this.prisma.accountRecharge;
  const balance = await this.prisma.accountRecharge.aggregate({
    where: {
      businessId,
    },
    _sum: {
      amount: true,
    },
  });

  const currentBalance = balance._sum.amount || 0;
  if (currentBalance < amount) {
    throw new Error(
      `Insufficient funds. Available: ${currentBalance}, Requested: ${amount}`
    );
  }

  // Get exchange rate
  const { tokenAmount, exchangeRate, fee } =
    await this.tokenExchangeRateService.convertFundsToTokens(amount);

  // Create token conversion transaction
  // Store both fund debit and token credit
  const conversionTransaction = await this.prisma.tokenTransaction.create({
    data: {
      business: { connect: { id: businessId } },
      amount: tokenAmount,
      type: 'PROFIT_SHARE', // Or create new type: CONVERSION
      isRedeemed: true,
      isReleased: true,
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Debit from account balance
  await this.prisma.accountRecharge.create({
    data: {
      amount: -amount,
      method: 'TOKEN',
      origin: 'RWANDA',
      business: { connect: { id: businessId } },
      status: 'COMPLETED',
      transactionDate: new Date(),
    },
  });

  return {
    success: true,
    transactionId: conversionTransaction.id,
    fundsAmount: amount,
    tokenAmount,
    exchangeRate,
    conversionFee: fee,
    status: 'COMPLETED',
    createdAt: conversionTransaction.createdAt,
    message: `Converted ${amount} to ${tokenAmount} tokens at rate ${exchangeRate}`,
  };
}
```

### 2.5 Add Resolver Method

**File:** `apps/back-api/src/token-transaction/token-transaction.resolver.ts`

```typescript
// Add to TokenTransactionResolver class

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("business")
@Mutation(() => TokenConversionResponseEntity, {
  description: "Converts account funds to tokens.",
})
async convertToTokens(
  @Args("input") convertToTokensInput: ConvertToTokensInput,
  @Context() context,
) {
  const user = context.req.user;

  // Ensure business can only convert their own funds
  if (user.id !== convertToTokensInput.businessId) {
    throw new Error(
      "Businesses can only convert their own funds"
    );
  }

  const result = await this.tokenTransactionService.convertFundsToTokens(
    convertToTokensInput,
    user.id,
  );

  // Publish events
  await this.pubSub.publish("TOKEN_TRANSACTION_CREATED", {
    tokenTransactionCreated: result,
  });

  return result;
}
```

---

## 3. GET_MOBILE_MONEY_CODE Implementation

### 3.1 Create USSD Service (Abstract)

**File:** `apps/back-api/src/payment-gateway/ussd/ussd.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

export interface USSDResponse {
  ussdCode: string;
  phoneNumber: string;
  amount: number;
  provider: string;
  expiresIn: number; // in seconds
}

@Injectable()
export abstract class USSDService {
  abstract generateUSSDCode(phoneNumber: string, amount: number): Promise<USSDResponse>;
  
  abstract validateUSSDCode(ussdCode: string): Promise<boolean>;
}
```

### 3.2 Create Input DTO

**File:** `apps/back-api/src/account-recharge/dto/get-mobile-money-code.input.ts`

```typescript
import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsPositive, IsMobilePhone } from 'class-validator';

@InputType()
export class GetMobileMoneyCodeInput {
  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsMobilePhone()
  phoneNumber: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  provider: string; // 'MTN_MONEY', 'AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA'

  @Field(() => String, { nullable: true })
  country?: string; // RWANDA, DRC, KENYA, etc.
}
```

### 3.3 Create Response Entity

**File:** `apps/back-api/src/account-recharge/entities/mobile-money-code.entity.ts`

```typescript
import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class MobileMoneyCodeEntity {
  @Field(() => String)
  ussdCode: string;

  @Field(() => String)
  phoneNumber: string;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  provider: string;

  @Field(() => Number)
  expiresIn: number; // in seconds

  @Field(() => String, { nullable: true })
  instructions?: string; // User-friendly instructions

  @Field(() => String, { nullable: true })
  requestId?: string; // For tracking
}
```

### 3.4 Create Provider-Specific Services

**File:** `apps/back-api/src/payment-gateway/ussd/mtn-ussd.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { USSDService, USSDResponse } from './ussd.service';

@Injectable()
export class MTNUSSDService extends USSDService {
  async generateUSSDCode(phoneNumber: string, amount: number): Promise<USSDResponse> {
    // MTN USSD format for Rwanda: *182*1*{amount}#
    // Validate phone number format
    const cleanPhone = this.normalizePhoneNumber(phoneNumber);

    const ussdCode = `*182*1*${Math.floor(amount)}#`;

    return {
      ussdCode,
      phoneNumber: cleanPhone,
      amount,
      provider: 'MTN_MONEY',
      expiresIn: 600, // 10 minutes
    };
  }

  async validateUSSDCode(ussdCode: string): Promise<boolean> {
    return /^\*182\*1\*\d+#$/.test(ussdCode);
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('250')) {
      if (cleaned.startsWith('0')) {
        cleaned = '250' + cleaned.slice(1);
      } else if (cleaned.length === 9) {
        cleaned = '250' + cleaned;
      }
    }
    
    return cleaned;
  }
}
```

**File:** `apps/back-api/src/payment-gateway/ussd/airtel-ussd.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { USSDService, USSDResponse } from './ussd.service';

@Injectable()
export class AirtelUSSDService extends USSDService {
  async generateUSSDCode(phoneNumber: string, amount: number): Promise<USSDResponse> {
    // Airtel USSD format for Rwanda: *100*1*{amount}*{pin}#
    const cleanPhone = this.normalizePhoneNumber(phoneNumber);
    
    // Note: For Airtel, PIN is typically entered by user
    const ussdCode = `*100*1*${Math.floor(amount)}#`;

    return {
      ussdCode,
      phoneNumber: cleanPhone,
      amount,
      provider: 'AIRTEL_MONEY',
      expiresIn: 600,
    };
  }

  async validateUSSDCode(ussdCode: string): Promise<boolean> {
    return /^\*100\*1\*\d+#$/.test(ussdCode);
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (!cleaned.startsWith('250')) {
      if (cleaned.startsWith('0')) {
        cleaned = '250' + cleaned.slice(1);
      } else if (cleaned.length === 9) {
        cleaned = '250' + cleaned;
      }
    }
    return cleaned;
  }
}
```

**File:** `apps/back-api/src/payment-gateway/ussd/mpesa-ussd.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { USSDService, USSDResponse } from './ussd.service';

@Injectable()
export class MPESAUSSDService extends USSDService {
  async generateUSSDCode(phoneNumber: string, amount: number): Promise<USSDResponse> {
    // M-Pesa USSD format for Kenya: *334*1*{amount}#
    const cleanPhone = this.normalizePhoneNumber(phoneNumber);
    
    const ussdCode = `*334*1*${Math.floor(amount)}#`;

    return {
      ussdCode,
      phoneNumber: cleanPhone,
      amount,
      provider: 'MPESA',
      expiresIn: 600,
    };
  }

  async validateUSSDCode(ussdCode: string): Promise<boolean> {
    return /^\*334\*1\*\d+#$/.test(ussdCode);
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (!cleaned.startsWith('254')) {
      if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.slice(1);
      } else if (cleaned.length === 9) {
        cleaned = '254' + cleaned;
      }
    }
    return cleaned;
  }
}
```

### 3.5 Create USSD Factory

**File:** `apps/back-api/src/payment-gateway/ussd/ussd-factory.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { USSDService } from './ussd.service';
import { MTNUSSDService } from './mtn-ussd.service';
import { AirtelUSSDService } from './airtel-ussd.service';
import { MPESAUSSDService } from './mpesa-ussd.service';

@Injectable()
export class USSDFactoryService {
  constructor(
    private mtnService: MTNUSSDService,
    private airtelService: AirtelUSSDService,
    private mpesaService: MPESAUSSDService,
  ) {}

  getProvider(provider: string): USSDService {
    const normalizedProvider = provider.toUpperCase();

    switch (normalizedProvider) {
      case 'MTN_MONEY':
      case 'MTN':
        return this.mtnService;
      case 'AIRTEL_MONEY':
      case 'AIRTEL':
        return this.airtelService;
      case 'MPESA':
      case 'M_PESA':
        return this.mpesaService;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
```

### 3.6 Add Service Method

**File:** `apps/back-api/src/account-recharge/account-recharge.service.ts`

```typescript
// Add to AccountRechargeService class

constructor(
  private prisma: PrismaService,
  private ussdFactory: USSDFactoryService,
) {}

async getMobileMoneyCode(
  input: GetMobileMoneyCodeInput,
): Promise<MobileMoneyCodeEntity> {
  const { amount, phoneNumber, provider, country } = input;

  // Validate amount
  if (amount <= 0 || amount > 10000000) {
    throw new Error('Amount must be between 0 and 10,000,000');
  }

  // Get USSD service for provider
  const ussdService = this.ussdFactory.getProvider(provider);

  // Generate USSD code
  const ussdResponse = await ussdService.generateUSSDCode(phoneNumber, amount);

  // Store USSD request for tracking/callback
  const ussdRequest = await this.prisma.ussdRequest.create({
    data: {
      amount,
      phoneNumber,
      provider: provider as any,
      ussdCode: ussdResponse.ussdCode,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + ussdResponse.expiresIn * 1000),
    },
  });

  return {
    ussdCode: ussdResponse.ussdCode,
    phoneNumber: ussdResponse.phoneNumber,
    amount,
    provider: ussdResponse.provider,
    expiresIn: ussdResponse.expiresIn,
    instructions: this.getUSSDInstructions(provider),
    requestId: ussdRequest.id,
  };
}

private getUSSDInstructions(provider: string): string {
  const instructions: Record<string, string> = {
    MTN_MONEY: 'Dial the USSD code and follow the prompts. Your PIN will be requested.',
    AIRTEL_MONEY: 'Dial the USSD code and enter your Airtel Money PIN when prompted.',
    MPESA: 'Dial the USSD code to initiate M-Pesa transfer.',
    ORANGE_MONEY: 'Dial the USSD code and follow Orange Money instructions.',
  };
  return instructions[provider] || 'Dial the code and follow the provider instructions.';
}
```

### 3.7 Add Resolver Method

**File:** `apps/back-api/src/account-recharge/account-recharge.resolver.ts`

```typescript
// Add to AccountRechargeResolver class

@Mutation(() => MobileMoneyCodeEntity, {
  name: "getMobileMoneyCode",
  description: "Generates a mobile money USSD code for payment.",
})
async getMobileMoneyCode(
  @Args("input") input: GetMobileMoneyCodeInput,
) {
  return this.accountRechargeService.getMobileMoneyCode(input);
}
```

---

## 4. Module Updates

### 4.1 Update Account Recharge Module

**File:** `apps/back-api/src/account-recharge/account-recharge.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AccountRechargeResolver } from './account-recharge.resolver';
import { AccountRechargeService } from './account-recharge.service';
import { PrismaModule } from '../prisma/prisma.module';
import { USSDFactoryService } from '../payment-gateway/ussd/ussd-factory.service';
import { MTNUSSDService } from '../payment-gateway/ussd/mtn-ussd.service';
import { AirtelUSSDService } from '../payment-gateway/ussd/airtel-ussd.service';
import { MPESAUSSDService } from '../payment-gateway/ussd/mpesa-ussd.service';

@Module({
  imports: [PrismaModule],
  providers: [
    AccountRechargeResolver,
    AccountRechargeService,
    USSDFactoryService,
    MTNUSSDService,
    AirtelUSSDService,
    MPESAUSSDService,
  ],
  exports: [AccountRechargeService],
})
export class AccountRechargeModule {}
```

### 4.2 Update Token Transaction Module

**File:** `apps/back-api/src/token-transaction/token-transaction.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TokenTransactionResolver } from './token-transaction.resolver';
import { TokenTransactionService } from './token-transaction.service';
import { TokenExchangeRateService } from './services/token-exchange-rate.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    TokenTransactionResolver,
    TokenTransactionService,
    TokenExchangeRateService,
  ],
  exports: [TokenTransactionService],
})
export class TokenTransactionModule {}
```

---

## 5. GraphQL Type Definitions

Update your GraphQL schema file to include:

```graphql
# Input Types
input WithdrawFundsInput {
  userId: String!
  userType: String!
  amount: Float!
  method: String
  bankAccount: String
  phoneNumber: String
  reason: String
}

input ConvertToTokensInput {
  businessId: String!
  amount: Float!
  description: String
}

input GetMobileMoneyCodeInput {
  amount: Float!
  phoneNumber: String!
  provider: String!
  country: String
}

# Response Types
type WithdrawalResponse {
  success: Boolean!
  transactionId: String!
  amount: Float!
  withdrawalFee: Float!
  netAmount: Float!
  status: String!
  message: String
  createdAt: DateTime!
  referenceNumber: String
  estimatedArrivalTime: Float
}

type TokenConversionResponse {
  success: Boolean!
  transactionId: String!
  fundsAmount: Float!
  tokenAmount: Float!
  exchangeRate: Float!
  conversionFee: Float
  status: String!
  createdAt: DateTime!
  message: String
}

type MobileMoneyCode {
  ussdCode: String!
  phoneNumber: String!
  amount: Float!
  provider: String!
  expiresIn: Int!
  instructions: String
  requestId: String
}

# Mutations
type Mutation {
  withdrawAccountFunds(input: WithdrawFundsInput!): WithdrawalResponse!
  convertToTokens(input: ConvertToTokensInput!): TokenConversionResponse!
  getMobileMoneyCode(input: GetMobileMoneyCodeInput!): MobileMoneyCode!
}
```

---

## 6. Environment Configuration

Add to `.env` file:

```env
# Token Exchange Rate (currency units per token)
TOKEN_EXCHANGE_RATE=100

# USSD Configuration
USSD_CODE_EXPIRY_SECONDS=600

# Withdrawal Configuration
WITHDRAWAL_FEE_PERCENTAGE=2.5
WITHDRAWAL_MIN_FEE=100

# Token Conversion Configuration
CONVERSION_FEE_PERCENTAGE=1
CONVERSION_MIN_FEE=10
```

---

## 7. Database Migration

Create migration file:

```sql
-- Create USSD Request tracking table
CREATE TABLE "USSDRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "amount" DOUBLE PRECISION NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "ussdCode" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "USSDRequest_createdAt_idx" ON "USSDRequest"("createdAt");
CREATE INDEX "USSDRequest_phoneNumber_idx" ON "USSDRequest"("phoneNumber");
```

---

## 8. Testing Checklist

- [ ] Unit tests for withdrawal validation
- [ ] Unit tests for token conversion calculations
- [ ] Unit tests for USSD code generation per provider
- [ ] Integration tests for complete withdrawal flow
- [ ] Integration tests for complete conversion flow
- [ ] Integration tests for USSD request storage
- [ ] Authorization tests (users can only access own funds)
- [ ] Error handling tests (insufficient funds, invalid amounts)
- [ ] Edge case tests (minimum/maximum amounts, fee calculations)

---

## 9. Deployment Checklist

- [ ] Database migrations run in staging
- [ ] Services deployed to staging
- [ ] GraphQL schema validated
- [ ] Frontend integration tested
- [ ] Payment gateway configurations verified
- [ ] Error monitoring configured
- [ ] Rate limiting configured for wallet operations
- [ ] Audit logging configured
- [ ] Backup and recovery tested
- [ ] Production deployment plan reviewed

---

## Notes

1. **Payment Gateway Integration**: The withdrawal implementation currently creates transactions but doesn't actually process payments. Integrate with your actual payment gateway (e.g., Stripe, PayPal, local providers) in the `withdraw()` method.

2. **USSD Callback**: Consider implementing a webhook handler to track USSD payment confirmations from mobile money providers.

3. **Fee Structure**: Current fees are hardcoded. Consider making them configurable per user role, amount range, or region.

4. **Security**: Add rate limiting and fraud detection before production deployment.

5. **Audit Trail**: Consider adding audit logging for all financial transactions.

---

Generated: June 2, 2026
Status: Ready for Implementation
