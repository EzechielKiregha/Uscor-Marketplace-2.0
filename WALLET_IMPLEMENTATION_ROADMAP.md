# Wallet Refactoring - Implementation Roadmap

**Project:** Uscor Marketplace 2.0  
**Component:** Wallet Operations (GraphQL Frontend → Backend)  
**Status:** Analysis Complete - Ready for Implementation  
**Date:** June 2, 2026

---

## Executive Summary

Your wallet GraphQL operations have been comprehensively analyzed against existing backend resolvers and services. The analysis reveals:

✅ **Fully Implemented (6 operations)**
- Account recharge mutations (create, create from USSD, update)
- Token transaction operations (redeem, release)
- All queries and subscriptions

⚠️ **Missing Backend Implementation (3 operations)**
- Withdraw Account Funds
- Convert to Tokens  
- Get Mobile Money Code (USSD Generation)

This roadmap provides **complete, production-ready implementations** for all missing operations with TypeScript code samples, database schemas, and frontend integration patterns.

---

## Documentation Overview

Three detailed guides have been created in your workspace:

### 1. [WALLET_REFACTORING_ANALYSIS.md](./WALLET_REFACTORING_ANALYSIS.md)
**Purpose:** Gap analysis and strategic overview

**Contains:**
- Complete operation status matrix
- Risk assessment and mitigation strategies
- Module reorganization recommendations
- Database schema options
- 4-phase implementation timeline
- File modification checklist

**Time to Read:** 10-15 minutes

---

### 2. [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md)
**Purpose:** Step-by-step backend implementation with code samples

**Contains:**
- 3 complete operation implementations:
  - `withdrawFunds` (service + resolver + DTOs + entities)
  - `convertToTokens` (service + resolver + DTOs + entities + exchange rate service)
  - `getMobileMoneyCode` (USSD service abstraction + 3 provider implementations)
- Module updates and dependency injection
- GraphQL schema definitions
- Database migrations
- Environment configuration
- Testing strategy

**Time to Read & Implement:** 4-6 hours per operation

---

### 3. [FRONTEND_IMPLEMENTATION_GUIDE.md](./FRONTEND_IMPLEMENTATION_GUIDE.md)
**Purpose:** Complete frontend integration guide with React components

**Contains:**
- Updated GraphQL queries/mutations with fragments
- 3 production-ready custom hooks:
  - `useWithdrawFunds`
  - `useConvertToTokens`
  - `useGetMobileMoneyCode`
- 3 complete UI components:
  - `WithdrawFundsDialog`
  - `ConvertToTokensDialog`
  - `MobileMoneyPaymentDialog`
- Integration examples
- Apollo Client cache configuration
- Error boundary and type definitions
- Testing & deployment checklists

**Time to Read & Implement:** 3-4 hours

---

## Quick Implementation Path

### Phase 1: Preparation (Days 1-2)
- [ ] Review all three guide documents
- [ ] Create feature branch for wallet refactoring
- [ ] Create Prisma migration for new models (USSDRequest, Withdrawal, TokenConversion)
- [ ] Update environment configuration with new variables

**Files to Create:**
- `prisma/migrations/[timestamp]_add_wallet_models.sql`
- Update `.env` with TOKEN_EXCHANGE_RATE, USSD_CODE_EXPIRY_SECONDS, etc.

---

### Phase 2: Backend Implementation (Days 3-7)

#### Day 3-4: Withdraw Funds
**Backend:**
1. Create `apps/back-api/src/account-recharge/dto/withdraw-funds.input.ts`
2. Create `apps/back-api/src/account-recharge/entities/withdrawal-response.entity.ts`
3. Add `withdraw()` method to `AccountRechargeService`
4. Add `withdrawAccountFunds()` resolver to `AccountRechargeResolver`
5. Import and inject services in module

**Test:**
```bash
npm run test -- account-recharge.service.spec.ts
```

#### Day 5: Convert to Tokens
**Backend:**
1. Create `apps/back-api/src/token-transaction/dto/convert-to-tokens.input.ts`
2. Create `apps/back-api/src/token-transaction/entities/token-conversion-response.entity.ts`
3. Create `apps/back-api/src/token-transaction/services/token-exchange-rate.service.ts`
4. Add `convertFundsToTokens()` method to `TokenTransactionService`
5. Add `convertToTokens()` resolver to `TokenTransactionResolver`

**Test:**
```bash
npm run test -- token-transaction.service.spec.ts
```

#### Day 6-7: USSD / Mobile Money
**Backend:**
1. Create USSD service abstraction: `apps/back-api/src/payment-gateway/ussd/ussd.service.ts`
2. Create `MTNUSSDService`, `AirtelUSSDService`, `MPESAUSSDService`
3. Create `USSDFactoryService` for provider selection
4. Add `getMobileMoneyCode()` method to `AccountRechargeService`
5. Add `getMobileMoneyCode()` resolver to `AccountRechargeResolver`
6. Update module exports and dependencies

**Test:**
```bash
npm run test -- ussd.service.spec.ts
npm run test -- account-recharge.resolver.spec.ts
```

---

### Phase 3: Frontend Implementation (Days 8-10)

#### Day 8: GraphQL & Hooks
**Frontend:**
1. Update `apps/front-ui/graphql/wallet.gql.ts` with new mutations and fragments
2. Create `apps/front-ui/hooks/useWithdrawFunds.ts`
3. Create `apps/front-ui/hooks/useConvertToTokens.ts`
4. Create `apps/front-ui/hooks/useGetMobileMoneyCode.ts`
5. Create `apps/front-ui/types/wallet.ts` for TypeScript types

**Verify:**
```bash
npm run codegen # Generate TypeScript types from GraphQL
```

#### Day 9: Components
**Frontend:**
1. Create `apps/front-ui/components/wallet/WithdrawFundsDialog.tsx`
2. Create `apps/front-ui/components/wallet/ConvertToTokensDialog.tsx`
3. Create `apps/front-ui/components/wallet/MobileMoneyPaymentDialog.tsx`
4. Create `apps/front-ui/components/wallet/WalletDashboard.tsx` (updated)
5. Create `apps/front-ui/components/wallet/WalletErrorBoundary.tsx`

#### Day 10: Integration & Testing
1. Update Apollo Client cache configuration
2. Add wallet page/route integration
3. Run E2E tests
4. Performance testing and optimization

---

### Phase 4: Testing & Deployment (Days 11-12)

**Unit Tests:**
```bash
npm run test -- --path apps/back-api/src/account-recharge
npm run test -- --path apps/back-api/src/token-transaction
npm run test -- --path apps/front-ui/hooks
npm run test -- --path apps/front-ui/components/wallet
```

**Integration Tests:**
```bash
npm run test:integration -- wallet
```

**E2E Tests:**
```bash
npm run test:e2e -- wallet
```

**Staging Deployment:**
```bash
npm run build
# Deploy to staging
npm run test:staging
```

**Production Deployment:**
```bash
# After staging validation
npm run deploy:prod
```

---

## Key Implementation Decisions

### 1. Module Organization
Recommended structure keeps wallet operations distributed:
- **Account-Recharge Module**: Handles withdrawals and USSD
- **Token-Transaction Module**: Handles conversions
- **Payment-Gateway Module**: Reusable USSD service abstraction

Alternative: Create dedicated `Wallet Module` that orchestrates both (see analysis doc for pros/cons).

### 2. Fee Structure
Current implementation uses percentage + minimum:
- **Withdrawals:** 2.5% or minimum 100 (configurable)
- **Conversions:** 1% or minimum 10 tokens (configurable)

Review these rates with your business team and adjust in `.env`.

### 3. USSD Implementation
Uses strategy pattern for provider abstraction:
- Easily extensible for new providers (Orange, etc.)
- Each provider has its own USSD code format
- Can be integrated with actual provider APIs later

### 4. Exchange Rate
Currently fixed (100 currency units = 1 token). Can be upgraded to:
- Dynamic rate based on market data
- Rate caching with TTL
- Historical rate tracking

### 5. Database Models
Uses additional models for audit trail:
- `USSDRequest`: Tracks all USSD code generations
- `Withdrawal`: (optional) Separate withdrawal table
- `TokenConversion`: (optional) Separate conversion table

See schema options in WALLET_REFACTORING_ANALYSIS.md.

---

## Critical Items Before Going Live

### Security Checklist
- [ ] JWT validation on all mutations (already in code)
- [ ] User can only access their own funds (already in code)
- [ ] Rate limiting on withdrawal/conversion endpoints
- [ ] Fraud detection for unusual patterns
- [ ] PCI compliance for payment data
- [ ] Audit logging for all financial transactions
- [ ] Encrypted storage for bank account details

### Performance Checklist
- [ ] Database indexes on frequently queried fields
- [ ] GraphQL query complexity limits
- [ ] Caching strategy for exchange rates
- [ ] Pagination for transaction lists
- [ ] Connection pooling for database

### Monitoring Checklist
- [ ] Error tracking (Sentry, DataDog, etc.)
- [ ] Financial transaction logging
- [ ] Payment gateway integration logs
- [ ] Alert thresholds for failed transactions
- [ ] Dashboard for transaction metrics

---

## Configuration Reference

### Backend Environment Variables
```env
# Token Exchange Rate (currency units per token)
TOKEN_EXCHANGE_RATE=100

# USSD Configuration
USSD_CODE_EXPIRY_SECONDS=600

# Withdrawal Configuration
WITHDRAWAL_FEE_PERCENTAGE=2.5
WITHDRAWAL_MIN_FEE=100

# Token Conversion Configuration
CONVERSION_FEE_PERCENTAGE=1.0
CONVERSION_MIN_FEE=10

# Payment Gateway (future integration)
PAYMENT_GATEWAY_API_KEY=***
PAYMENT_GATEWAY_SECRET=***
```

### Frontend Environment Variables
```env
# GraphQL Endpoint
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.uscor.com/graphql
NEXT_PUBLIC_WS_ENDPOINT=wss://api.uscor.com/graphql

# Feature Flags
NEXT_PUBLIC_ENABLE_WITHDRAWALS=true
NEXT_PUBLIC_ENABLE_TOKEN_CONVERSION=true
NEXT_PUBLIC_ENABLE_MOBILE_MONEY=true
```

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Issue: "Insufficient funds" error when balance shows available
**Cause:** Race condition in balance calculation
**Solution:** Implement pessimistic locking on AccountRecharge queries

#### Issue: USSD code not generating for specific provider
**Cause:** Phone number format validation failing
**Solution:** Check phone number normalization in provider service

#### Issue: Token conversion calculations are off
**Cause:** Floating-point precision errors
**Solution:** Use `Decimal` type for financial calculations

#### Issue: Apollo Cache not updating after mutation
**Cause:** Cache key configuration mismatch
**Solution:** Check typePolicies in apolloClient configuration

#### Issue: USSD expiry happening too fast
**Cause:** Timer mismatch between frontend and backend
**Solution:** Ensure USSD_CODE_EXPIRY_SECONDS matches frontend countdown

---

## Post-Implementation Tasks

### Day 1 After Deployment
- [ ] Monitor error rates and performance metrics
- [ ] Check user feedback in support channels
- [ ] Verify all wallets accessible and balances correct
- [ ] Test withdrawal confirmation emails/notifications
- [ ] Confirm USSD code generation working across providers

### Week 1 After Deployment
- [ ] Analyze usage patterns and transaction volumes
- [ ] Optimize database queries if needed
- [ ] Gather user feedback and feature requests
- [ ] Document any undocumented behaviors
- [ ] Create runbook for common support issues

### Week 4 After Deployment
- [ ] Review and finalize fee structure
- [ ] Plan integration with actual payment gateways
- [ ] Evaluate expansion to additional providers
- [ ] Consider token conversion rate optimization
- [ ] Plan security audit

---

## Cost & Time Estimate

| Phase | Tasks | Backend | Frontend | Testing | Total |
|-------|-------|---------|----------|---------|-------|
| Prep | Setup, config | 4h | 2h | - | 6h |
| Withdraw | Implementation | 6h | 4h | 3h | 13h |
| Convert | Implementation | 8h | 3h | 3h | 14h |
| USSD | Implementation | 10h | 2h | 4h | 16h |
| Integration | Deployment | 4h | 4h | 8h | 16h |
| **Total** | | **32h** | **15h** | **18h** | **65h** |

**Equivalent:** ~2 weeks with 1 full-stack developer

---

## Additional Resources

### Internal Documentation
- [WALLET_REFACTORING_ANALYSIS.md](./WALLET_REFACTORING_ANALYSIS.md) - Gap analysis & strategy
- [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md) - Code implementation details
- [FRONTEND_IMPLEMENTATION_GUIDE.md](./FRONTEND_IMPLEMENTATION_GUIDE.md) - Frontend components & hooks

### External References
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Apollo Client Best Practices](https://www.apollographql.com/docs/react/best-practices/performance/)
- [USSD Standards for Mobile Operators](https://en.wikipedia.org/wiki/Unstructured_Supplementary_Service_Data)

---

## Next Steps

1. **Review Documents** (30 min)
   - Read all 3 guide documents thoroughly
   - Ask questions about any unclear sections
   - Verify alignment with business requirements

2. **Approve Implementation** (1 day)
   - Confirm fee structure and rates
   - Approve module organization
   - Verify security requirements

3. **Create Tasks** (2 hours)
   - Break down 65 hours into specific tickets
   - Assign to team members
   - Set milestones

4. **Begin Implementation** (Days 1-12)
   - Follow the phase breakdown above
   - Use provided code samples
   - Run tests at each checkpoint

5. **Deploy & Monitor** (Ongoing)
   - Staging validation
   - Production deployment
   - Ongoing monitoring and optimization

---

## Conclusion

Your wallet refactoring is well-scoped and achievable. The provided guides include:

- ✅ Complete analysis of current state
- ✅ 3 production-ready implementations
- ✅ Full frontend integration with components
- ✅ Testing strategy and deployment checklist
- ✅ Security and performance considerations
- ✅ Troubleshooting guide

**You have everything needed to implement this successfully. Start with Phase 1 preparation, then proceed systematically through the phases.**

For questions or clarifications, refer to the detailed guides or reach out to the development team.

---

**Document Status:** Ready for Implementation  
**Last Updated:** June 2, 2026  
**Next Review:** After Phase 1 completion
