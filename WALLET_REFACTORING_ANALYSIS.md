# Wallet GraphQL Refactoring Analysis

## Executive Summary
This document analyzes the wallet GraphQL operations in `front-ui/graphql/wallet.gql.ts` against existing backend resolvers and services. It identifies gaps, proposes refactoring strategies, and outlines required implementations.

---

## 1. Current GraphQL Operations Analysis

### 1.1 Queries (All Implemented ✅)
| Query | Backend Resolver | Status | Notes |
|-------|------------------|--------|-------|
| `GET_ACCOUNT_BALANCE` | `accountBalance` (account-recharge.resolver) | ✅ | Returns balance for business/client |
| `GET_ACCOUNT_RECHARGES` | `accountRecharges` (account-recharge.resolver) | ✅ | Paginated recharge history |
| `GET_TOKEN_TRANSACTIONS` | `tokenTransactions` (token-transaction.resolver) | ✅ | Paginated token transactions |
| `GET_TOKEN_BALANCE` | `tokenBalance` (token-transaction.resolver) | ✅ | Token balance summary |

### 1.2 Mutations - Mapping Status

| GraphQL Mutation | Input Type | Backend Resolver | Status | Gap |
|-----------------|-----------|-----------------|--------|-----|
| `CREATE_ACCOUNT_RECHARGE` | `CreateAccountRechargeInput` | `createAccountRecharge` | ✅ | None |
| `CREATE_ACCOUNT_RECHARGE_FROM_USSD` | `CreateAccountRechargeInput` | `createAccountRechargeFromUSSD` | ✅ | None |
| `UPDATE_ACCOUNT_RECHARGE` | `UpdateAccountRechargeInput` | `updateAccountRecharge` | ✅ | None |
| `WITHDRAW_ACCOUNT_FUNDS` | `WithdrawFundsInput` | ❌ MISSING | ⚠️ | **NEEDS IMPLEMENTATION** |
| `CONVERT_TO_TOKENS` | `ConvertToTokensInput` | ❌ MISSING | ⚠️ | **NEEDS IMPLEMENTATION** |
| `REDEEM_TOKENS` | `RedeemTokensInput` | `redeemTokenTransaction` | ✅ | Minor naming inconsistency |
| `RELEASE_TOKENS` | `ReleaseTokensInput` | `releaseTokenTransaction` | ✅ | Minor naming inconsistency |
| `GET_MOBILE_MONEY_CODE` | `GetMobileMoneyCodeInput` | ❌ MISSING | ⚠️ | **NEEDS IMPLEMENTATION** |

### 1.3 Subscriptions (All Implemented ✅)
| Subscription | Backend Handler | Status |
|-------------|-----------------|--------|
| `ON_ACCOUNT_RECHARGE_CREATED` | `accountRechargeCreated` | ✅ |
| `ON_TOKEN_TRANSACTION_CREATED` | `tokenTransactionCreated` | ✅ |
| `ON_ACCOUNT_BALANCE_UPDATED` | `accountBalanceUpdated` | ✅ |

---

## 2. Missing Backend Operations

### 2.1 Withdraw Account Funds
**GraphQL Definition:**
```typescript
WITHDRAW_ACCOUNT_FUNDS: mutation WithdrawAccountFunds($input: WithdrawFundsInput!) {
  withdrawFunds(input: $input) {
    success: Boolean
    transactionId: String
    withdrawalFee: Float
    netAmount: Float
    status: String
  }
}
```

**Required Implementation:**
- **Service Method:** `AccountRechargeService.withdraw()`
- **Resolver Method:** `AccountRechargeResolver.withdrawAccountFunds()`
- **Input DTO:** Create `WithdrawFundsInput` in account-recharge module
- **Response Type:** Create `WithdrawalResponseEntity`
- **Business Logic:**
  - Validate sufficient balance
  - Calculate withdrawal fees (need fee structure)
  - Create debit transaction
  - Update account balance
  - Return withdrawal confirmation

**Database Consideration:** May need to add withdrawal tracking fields or create new `Withdrawal` model

---

### 2.2 Convert to Tokens
**GraphQL Definition:**
```typescript
CONVERT_TO_TOKENS: mutation ConvertToTokens($input: ConvertToTokensInput!) {
  convertToTokens(input: $input) {
    success: Boolean
    tokenAmount: Float
    convertedAmount: Float
    transactionId: String
  }
}
```

**Required Implementation:**
- **Service Method:** `TokenTransactionService.convertFromFunds()` OR new `TokenConversionService`
- **Resolver Method:** Add to `TokenTransactionResolver` or create `TokenConversionResolver`
- **Input DTO:** Create `ConvertToTokensInput`
- **Response Type:** Create `TokenConversionResponseEntity`
- **Business Logic:**
  - Get current token exchange rate (need config/provider)
  - Validate sufficient account funds
  - Create conversion transaction
  - Debit account balance
  - Credit token balance
  - Return conversion details

**Database Consideration:** May need to track conversion rate/rate history

---

### 2.3 Get Mobile Money Code (USSD)
**GraphQL Definition:**
```typescript
GET_MOBILE_MONEY_CODE: mutation GetMobileMoneyCode($input: GetMobileMoneyCodeInput!) {
  getMobileMoneyCode(input: $input) {
    ussdCode: String
    phoneNumber: String
    amount: Float
    provider: String
  }
}
```

**Required Implementation:**
- **Service Method:** Create `USSDService` or add to `PaymentService`
- **Resolver Method:** Add to `AccountRechargeResolver` 
- **Input DTO:** Create `GetMobileMoneyCodeInput`
- **Response Type:** Create `MobileMoneyCodeEntity`
- **Business Logic:**
  - Generate USSD code format based on amount & provider
  - Validate phone number
  - Store USSD request for callback tracking
  - Return USSD string and payment details

**Database Consideration:** Need to track USSD requests for verification callback

**External Integration:** Requires mobile money provider API integration (MTN, Airtel, Orange, M-Pesa)

---

## 3. Refactoring Recommendations

### 3.1 Module Organization
**Current Structure Issues:**
- Wallet operations split across `account-recharge` and `token-transaction` modules
- No dedicated wallet/payment coordination module

**Recommended Structure:**
```
src/
├── wallet/
│   ├── wallet.resolver.ts (centralized wallet operations)
│   ├── wallet.service.ts (orchestrates account & token services)
│   ├── entities/
│   │   ├── withdrawal-response.entity.ts
│   │   ├── token-conversion-response.entity.ts
│   │   └── mobile-money-code.entity.ts
│   └── dto/
│       ├── withdraw-funds.input.ts
│       ├── convert-to-tokens.input.ts
│       └── get-mobile-money-code.input.ts
├── payment-gateway/
│   ├── ussd/
│   │   ├── ussd.service.ts (abstract)
│   │   ├── mtn-ussd.service.ts
│   │   ├── airtel-ussd.service.ts
│   │   ├── orange-ussd.service.ts
│   │   └── mpesa-ussd.service.ts
│   └── config/
│       └── payment-gateway.config.ts
├── account-recharge/
│   ├── account-recharge.resolver.ts (keep focused on recharges)
│   ├── account-recharge.service.ts
│   └── ...
└── token-transaction/
    ├── token-transaction.resolver.ts (keep focused on tokens)
    ├── token-transaction.service.ts
    └── ...
```

### 3.2 GraphQL Query Naming Consistency

**Current Issues:**
- `REDEEM_TOKENS` calls `redeemTokens` ✅ (consistent)
- `RELEASE_TOKENS` calls `releaseTokens` ✅ (consistent)
- `WITHDRAW_ACCOUNT_FUNDS` calls `withdrawFunds` ✅ (follows pattern)
- `CONVERT_TO_TOKENS` calls `convertToTokens` ✅ (follows pattern)

**No changes needed** - naming is already consistent.

### 3.3 Input Validation & Error Handling

**Recommendations:**
1. Add consistent validation for:
   - Amount (positive, within limits)
   - User authorization (business/client can only access own funds)
   - Sufficient balance checks
   - Exchange rate availability

2. Create custom exceptions:
   - `InsufficientFundsException`
   - `InvalidWithdrawalException`
   - `TokenConversionFailedException`
   - `USSDGenerationException`

---

## 4. Database Schema Updates Required

### 4.1 New Fields/Models

**Option A: Extend Existing Models**
```prisma
model AccountRecharge {
  // ... existing fields
  
  // Add withdrawal tracking
  withdrawalId          String?
  withdrawalFee         Float?
  netAmount             Float?
}

model TokenTransaction {
  // ... existing fields
  
  // Add conversion tracking
  conversionRate        Float?
  conversionId          String?
}
```

**Option B: Create New Models** (Recommended)
```prisma
model Withdrawal {
  id                 String    @id @default(uuid())
  amount             Float
  fee                Float
  netAmount          Float
  status             PaymentStatus
  business           Business? @relation(fields: [businessId], references: [id])
  businessId         String?
  client             Client?   @relation(fields: [clientId], references: [id])
  clientId           String?
  createdAt          DateTime  @default(now())
}

model TokenConversion {
  id                 String    @id @default(uuid())
  businessId         String
  business           Business  @relation(fields: [businessId], references: [id])
  fundsAmount        Float
  tokenAmount        Float
  exchangeRate       Float
  status             PaymentStatus
  createdAt          DateTime  @default(now())
}

model USSDRequest {
  id                 String     @id @default(uuid())
  amount             Float
  phoneNumber        String
  provider           RechargeMethod
  ussdCode           String
  status             PaymentStatus
  createdAt          DateTime   @default(now())
  expiresAt          DateTime
}
```

---

## 5. Implementation Priority

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create input DTOs for all missing operations
- [ ] Create response entity types
- [ ] Add wallet module scaffolding
- [ ] Add database migration for new models

### Phase 2: Core Functionality (Weeks 2-3)
- [ ] Implement withdraw funds (service + resolver)
- [ ] Implement token conversion (service + resolver)
- [ ] Add validation and error handling
- [ ] Write unit tests

### Phase 3: External Integration (Weeks 3-4)
- [ ] Create USSD service abstraction
- [ ] Implement provider-specific USSD generators
- [ ] Integrate payment gateway configs
- [ ] Write integration tests

### Phase 4: Frontend Alignment (Weeks 4+)
- [ ] Update GraphQL hooks on frontend
- [ ] Implement UI for new operations
- [ ] E2E testing
- [ ] Performance optimization

---

## 6. Frontend GraphQL Adjustments

### Required Mutations to Update

**Current (No changes needed):**
- ✅ CREATE_ACCOUNT_RECHARGE
- ✅ CREATE_ACCOUNT_RECHARGE_FROM_USSD
- ✅ UPDATE_ACCOUNT_RECHARGE
- ✅ REDEEM_TOKENS
- ✅ RELEASE_TOKENS

**Add New Hooks for:**
- 🆕 `useWithdrawFunds` - calls WITHDRAW_ACCOUNT_FUNDS
- 🆕 `useConvertToTokens` - calls CONVERT_TO_TOKENS
- 🆕 `useGetMobileMoneyCode` - calls GET_MOBILE_MONEY_CODE

### Required Cache Updates

```typescript
// Apollo Client cache patterns
const ACCOUNT_BALANCE_CACHE_KEY = 'accountBalance';
const TOKEN_BALANCE_CACHE_KEY = 'tokenBalance';
const ACCOUNT_RECHARGES_CACHE_KEY = 'accountRecharges';

// Update caches after mutations
afterMutationHooks = {
  withdrawFunds: updateAccountBalance,
  convertToTokens: [updateAccountBalance, updateTokenBalance],
  redeemTokens: updateTokenBalance,
  releaseTokens: updateTokenBalance,
};
```

---

## 7. Testing Strategy

### Backend Unit Tests
- Withdrawal validation (insufficient funds, fees, etc.)
- Token conversion rate calculations
- USSD code generation for each provider
- Authorization checks for all operations

### Integration Tests
- Full withdrawal flow with database updates
- Token conversion affecting both balances
- USSD request lifecycle
- Subscription updates (balance changed, etc.)

### E2E Tests
- Complete user journey: deposit → convert → withdraw
- Multi-provider USSD scenarios
- Error recovery flows

---

## 8. Implementation Checklist

- [ ] Database migrations created and tested
- [ ] Input DTOs implemented with validation
- [ ] Response entity types created
- [ ] Wallet service orchestration layer
- [ ] Account withdrawal resolver & service
- [ ] Token conversion resolver & service
- [ ] USSD service abstraction + providers
- [ ] GraphQL type definitions finalized
- [ ] Frontend hooks updated
- [ ] Cache invalidation logic
- [ ] Error boundary components
- [ ] Unit tests (90%+ coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance benchmarks
- [ ] Security audit (payment operations)
- [ ] Documentation updated
- [ ] Staging environment testing
- [ ] Production deployment plan

---

## 9. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Balance inconsistency after withdrawal | HIGH | Transaction wrapping, compensation logic |
| USSD provider downtime | HIGH | Fallback providers, offline queue |
| Token exchange rate volatility | MEDIUM | Rate locking during conversion, audit trail |
| User authorization bypass | CRITICAL | Strict JWT validation, rate limiting |
| Double-submission | MEDIUM | Idempotent mutation keys, duplicate detection |

---

## 10. Files to Modify/Create

### Backend
- Create: `src/wallet/wallet.module.ts`
- Create: `src/wallet/wallet.service.ts`
- Create: `src/wallet/wallet.resolver.ts`
- Create: `src/wallet/entities/*.ts`
- Create: `src/wallet/dto/*.ts`
- Create: `src/payment-gateway/ussd/*.ts`
- Modify: `src/account-recharge/account-recharge.service.ts` (add withdraw)
- Modify: `src/token-transaction/token-transaction.service.ts` (add convert)
- Create: `prisma/migrations/[timestamp]_add_wallet_models.sql`

### Frontend
- Modify: `graphql/wallet.gql.ts` (add new input types)
- Create: `hooks/useWithdrawFunds.ts`
- Create: `hooks/useConvertToTokens.ts`
- Create: `hooks/useGetMobileMoneyCode.ts`
- Modify: Relevant component hooks

### Tests
- Create: `src/wallet/wallet.service.spec.ts`
- Create: `src/wallet/wallet.resolver.spec.ts`
- Create: `src/payment-gateway/ussd/*.spec.ts`

---

Generated: June 2, 2026
Status: Analysis Complete - Ready for Implementation Planning
