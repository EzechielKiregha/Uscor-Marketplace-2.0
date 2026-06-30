# PHASES 14-21 — USCOR 2.1 COMPLETION PLANS
## Offline Login, Platform Admin, B2B, Subscriptions, Wallet Security, Token Review, Payment Architecture, Commerce Testing

---

# PHASE 14 — OFFLINE LOGIN (Worker-Only)

## Current State
| Component | Status | File |
|-----------|--------|------|
| IndexedDB v2 | COMPLETE | `lib/indexed-db.ts` — 7 stores (offlineOps, workerCache, localSales, localInventory, localChat, syncMetadata, conflictLog) |
| Device fingerprint | COMPLETE | `lib/device-id.ts` — persistent `device-{uuid}` in localStorage |
| Product catalog cache | COMPLETE | `lib/catalog-cache.ts` — offline product lookup |
| Offline POS hook | COMPLETE | `hooks/use-offline-pos.ts` — create/complete sales offline, sync engine |
| Sync status bar | COMPLETE | `components/SyncStatusBar.tsx` — visual sync indicator |
| Service worker | COMPLETE | `app/sw.ts` — Serwist, Background Sync, image cache, offline fallback |
| Auth JWT tokens | COMPLETE | access 1d, refresh 7d, payload: `{sub, role}` |
| TrustedDevice model | COMPLETE | Prisma schema — userId, deviceId, userAgent |
| SecurityLog model | COMPLETE | Prisma schema — audit trail for auth events |

## Spec Requirements (from IMPROVE USCOR-2.md)
- Only **workers** can login offline (Business/Admin/Client must stay online)
- Online login once → credentials cached securely → encrypted local session → offline token → limited permissions
- Offline-allowed: POS, Inventory, Sales, Receipts, Customer lookup, Returns, Shift operations, Queue management
- Restricted offline: Wallet, Subscriptions, Admin Panel, Payments, KYC, Business Setup, Account Conversion, System Settings
- Display: Offline Worker Mode indicator, Pending Synchronization, Last Connected, Queued Transactions

## Implementation Plan

### Sub-phase 14A: Backend — Offline Auth Token Infrastructure

**New methods in `auth.service.ts`:**
- `generateOfflineToken(workerId)` → long-lived JWT (30d) with `{sub, role:'worker', type:'offline', businessId, storeIds[], permissions[]}`
- `validateOfflineSession(workerId, deviceId)` → check TrustedDevice, return worker profile
- `registerWorkerDevice(workerId, deviceId, userAgent)` → create/update TrustedDevice

**New GraphQL mutations in `auth.resolver.ts`:**
- `requestOfflineAccess(deviceId: String!)` → OfflineAccessPayload (JWT-guarded, worker-only)
- `revokeOfflineAccess(workerId: String!, deviceId: String!)` → MessageResult

**New files:**
| File | Purpose |
|------|---------|
| `auth/dto/request-offline-access.input.ts` | `{ deviceId: String }` |
| `auth/entities/offline-access-payload.entity.ts` | `{ offlineToken, expiresAt, permissions[], workerProfile, businessInfo }` |

### Sub-phase 14B: Frontend — Encrypted Credential Storage

**New file: `lib/offline-auth.ts`** — core offline auth manager
- Web Crypto API (AES-GCM) encryption with PBKDF2 key from device-id + worker-id
- `cacheWorkerCredentials()`, `getOfflineCredentials()`, `validateOfflineToken()`, `clearOfflineCredentials()`
- Permission constants: `OFFLINE_PERMISSIONS`, `RESTRICTED_OFFLINE`

**Modify `lib/indexed-db.ts`:** bump v2 → v3, add `offlineSession` store

### Sub-phase 14C: Frontend — Offline Login Flow & UI

**New files:**
| File | Purpose |
|------|---------|
| `hooks/use-offline-auth.ts` | React hook: offline auth state, loginOffline(), requestOfflineAccess(), logoutOffline() |
| `components/OfflineLoginForm.tsx` | Worker offline login UI — PIN/password, worker avatar, session info |
| `components/OfflineWorkerBanner.tsx` | Persistent offline mode indicator with sync controls |

**Modified files:**
| File | Changes |
|------|---------|
| `app/(auth)/login/page.tsx` | Detect offline → show OfflineLoginForm or "connect" message |
| `graphql/auth.gql.ts` | Add REQUEST_OFFLINE_ACCESS, REVOKE_OFFLINE_ACCESS mutations |

### Sub-phase 14D: Integration & Permission Guards

**Modified files:**
| File | Changes |
|------|---------|
| `lib/auth.ts` | Add `isOfflineMode()`, `getEffectiveToken()`, `getEffectivePermissions()` |
| `lib/useMe.ts` | Offline worker fallback — return cached profile, add `isOfflineSession` flag |
| `hooks/use-offline-pos.ts` | Use offline auth state, skip GraphQL when offline-authenticated |
| `app/(worker)/worker/page.tsx` | Show OfflineWorkerBanner, permission guards |
| `app/sw.ts` | Cache worker dashboard + login routes |

---

# PHASE 15 — PLATFORM ADMIN COMPLETION

## Current State
| Component | Status | File |
|-----------|--------|------|
| Admin dashboard | EXISTS | `(platform)/admin/` — DashboardOverview, AuditLogs, Announcements |
| KYC Management | EXISTS | KycManagement component |
| Disputes | EXISTS | Disputes component |
| Platform Settings | EXISTS | PlatformSettings component |
| Users | EXISTS | Users component |
| Verification | EXISTS | Verification component |

## Spec Requirements
Complete platform governance — USCOR should feel SaaS-ready.

### Missing Features (Priority Order)
| Feature | Priority | Plan |
|---------|----------|------|
| Dashboard stats (users, businesses, workers, transactions, revenue, tokens, wallet volume) | HIGHEST | Aggregate queries, stat cards grid |
| Pending KYC count + queue | HIGHEST | KYC queue with status filters, timeline |
| KYC document uploads (Trade License, ID, TIN, Certificates, Proof of Address, Store Photos) | HIGH | File upload + review UI |
| KYC status tracking (Draft → Submitted → Pending → Approved/Rejected → Expired) | HIGH | Status pipeline with timeline |
| Business management (verify, suspend, feature-flag) | HIGH | Business detail panel + actions |
| Worker management across businesses | HIGH | Cross-business worker list |
| Marketplace oversight (flagged products, reports) | MEDIUM | Content moderation queue |
| Token monitoring (total supply, circulation, conversion volume) | MEDIUM | Token dashboard |
| Wallet monitoring (total balances, suspicious activity) | MEDIUM | Wallet overview panel |
| Growth metrics (signup trends, GMV, MAU) | MEDIUM | Charts + period comparisons |
| Feature flags | LOW | Toggle features per business/plan |
| Moderation tools | LOW | Content review queue |

### Implementation Plan

**New backend:**
- `platform-analytics.service.ts` — aggregate queries for dashboard stats
- `platform-analytics.resolver.ts` — `platformDashboard` query
- Extend KYC module with document upload, status transitions, admin review

**New frontend components:**
| File | Purpose |
|------|---------|
| `admin/_components/PlatformDashboard.tsx` | Stats grid: users, businesses, workers, transactions, revenue, tokens |
| `admin/_components/KycReviewPanel.tsx` | Document viewer, approve/reject actions, timeline |
| `admin/_components/BusinessManagement.tsx` | Business list with verification status, actions |
| `admin/_components/WorkerManagement.tsx` | Cross-business worker overview |
| `admin/_components/TokenDashboard.tsx` | Token metrics, conversion volume |
| `admin/_components/GrowthMetrics.tsx` | Signup trends, GMV charts |

**Modified files:**
- `admin/page.tsx` — integrate new dashboard components
- KYC module — add document type enum, upload flow, review mutations

---

# PHASE 16 — B2B ENABLEMENT

## Current State
- B2B infrastructure partially exists (Transfer Orders, Purchase Orders in inventory)
- Business verification (KYC) exists but not fully wired to B2B access
- No wholesale pricing, procurement, or vendor marketplace

## Spec Requirements
Make B2B operational. Only approved (KYC-verified) businesses can participate.

### Features to Implement
| Feature | Priority | Plan |
|---------|----------|------|
| Wholesale pricing (tiered, volume-based) | HIGH | Extend Product model with wholesalePrice, minBulkQuantity |
| B2B verification gate | HIGH | Check business KYC status before B2B features |
| Purchase requests | HIGH | New PurchaseRequest model, approval workflow |
| Vendor marketplace indicators | MEDIUM | Badges: Verified Vendor, B2B Enabled, Wholesale Seller |
| Inter-store purchases | MEDIUM | Business-to-business order flow |
| RFQ (Request for Quote) | LOW | RFQ model, negotiation thread |
| B2B Chat | LOW | Business-to-business messaging |
| Vendor ratings | LOW | Rating/review system for B2B |

### Implementation Plan

**New Prisma models:**
```
WholesalePrice { productId, minQuantity, price, businessTypeRestriction? }
PurchaseRequest { fromBusinessId, toBusinessId, items[], status, notes }
```

**New backend modules:**
- `b2b/b2b.module.ts` — B2B service + resolver
- `b2b/b2b.service.ts` — wholesale pricing, purchase requests, vendor verification
- `b2b/b2b.resolver.ts` — mutations: createPurchaseRequest, approvePurchaseRequest, etc.

**New frontend:**
| File | Purpose |
|------|---------|
| `business/b2b/page.tsx` | B2B hub: vendor status, purchase requests, wholesale catalog |
| `business/b2b/_components/WholesalePricing.tsx` | Set wholesale prices per product |
| `business/b2b/_components/PurchaseRequests.tsx` | Incoming/outgoing purchase requests |
| `business/b2b/_components/VendorProfile.tsx` | Public vendor profile with badges |
| `marketplace/` | Add B2B filter, wholesale indicators on product cards |

**Marketplace indicators:** Use existing `StatusBadge` component with new variants for "Verified Vendor", "B2B Enabled", "Wholesale Seller".

---

# PHASE 17 — SUBSCRIPTIONS (Architecture Only)

## Spec Note
> "Do not implement fully. Prepare architecture. Mark as roadmap."

### Plan
| Feature | Status Badge | Details |
|---------|-------------|---------|
| Subscription plans (Starter, Growth, Pro, Enterprise) | `variant="planned"` | Define plan tiers in config |
| Multiple Stores | `variant="coming-soon"` | Gate by plan tier |
| Advanced Analytics | `variant="coming-soon"` | Gate by plan tier |
| Advanced Reports | `variant="coming-soon"` | Gate by plan tier |
| B2B Access | `variant="next"` | Gate by plan tier |
| Priority Support | `variant="planned"` | Support ticket priority |
| Custom Branding | `variant="pro"` | Logo, colors per business |
| API Access | `variant="planned"` | Developer API keys |

### Implementation Plan

**New config file:** `config/subscription-plans.ts`
```ts
export const SUBSCRIPTION_PLANS = {
  STARTER: { name: 'Starter', maxStores: 1, features: [...], price: 0 },
  GROWTH: { name: 'Growth', maxStores: 3, features: [...], price: 29 },
  PRO: { name: 'Pro', maxStores: 10, features: [...], price: 79 },
  ENTERPRISE: { name: 'Enterprise', maxStores: 'unlimited', features: [...], price: 'custom' },
}
```

**New Prisma models:**
```
Subscription { businessId, plan, status, startsAt, endsAt, autoRenew }
SubscriptionFeature { subscriptionId, featureKey, enabled }
```

**New frontend:**
| File | Purpose |
|------|---------|
| `business/subscription/page.tsx` | Current plan, upgrade options, feature comparison |
| `config/subscription-plans.ts` | Plan definitions, feature gates |

**All gated features show StatusBadge** with appropriate variant (planned, coming-soon, next, beta, pro).

---

# PHASE 18 — WALLET SECURITY

## Current State
| Component | Status | File |
|-----------|--------|------|
| Wallet page | EXISTS | `wallet/page.tsx` |
| ConvertModal | EXISTS | Token conversion UI |
| RechargeModal | EXISTS | Wallet recharge UI |
| WithdrawModal | EXISTS | Withdrawal UI |
| TokenManagement | EXISTS | UTN token management |
| TransactionHistory | EXISTS | Transaction list |

## Spec Requirements
> "Analyze current implementation. Do not rewrite blindly."

### Security Audit Checklist
| Concern | Check | Action |
|---------|-------|--------|
| Atomic transactions | Review wallet mutation isolation | Add Prisma `$transaction` wrappers |
| Double spend protection | Check concurrent balance updates | Add optimistic locking (version field) |
| Audit logs | Review if all balance changes are logged | Add WalletAuditLog model |
| Idempotency | Check duplicate transaction prevention | Add idempotency keys to mutations |
| Balance validation | Check negative balance prevention | Add DB-level CHECK constraint |
| Ledger pattern | Review if ledger entries exist | Add LedgerEntry model if missing |
| Immutable logs | Check if transaction records can be modified | Add audit trail |
| Rate limiting | Check withdrawal/transfer frequency | Add per-user rate limits |

### Implementation Plan

**New Prisma models:**
```
WalletAuditLog { walletId, action, amount, balanceBefore, balanceAfter, metadata, createdAt }
LedgerEntry { walletId, type (CREDIT/DEBIT), amount, reference, description, createdAt }
```

**Backend changes:**
- Wrap all wallet mutations in `prisma.$transaction()`
- Add version field to Wallet for optimistic locking
- Create ledger entries for every balance movement
- Add idempotency key checks
- Log all wallet operations to WalletAuditLog

**Frontend changes:**
- Add transaction confirmation dialogs
- Show balance change previews before confirming
- Add wallet activity timeline (using ActivityTimeline component)

---

# PHASE 19 — TOKEN SYSTEM REVIEW

## Current State
- UTN Token: 1 UTN = 10 USD
- Token conversion, purchase, spending flows exist

## Spec Requirements
> "Validate token economics. Validate conversion. Validate precision. Validate rounding. Validate consistency."

### Validation Checklist
| Area | Check |
|------|-------|
| Conversion precision | Float vs Decimal — check rounding errors |
| B2B token payments | Verify business-to-business token flow |
| B2C token payments | Verify customer token purchases |
| Freelance token payments | Verify service booking token flow |
| Escrow token handling | Verify tokens in escrow don't double-count |
| Commission calculation | Verify platform commission on token transactions |
| Refund token flow | Verify token refund restores correct balance |
| Token supply tracking | Verify total supply = sum of all wallet balances |

### Implementation Plan
- Audit all token-related resolvers and services
- Add Decimal.js for precise financial calculations (replace Float arithmetic)
- Add token reconciliation query for admin dashboard
- Add token flow diagrams to documentation
- Output: **Token Audit Report** documenting findings + fixes

---

# PHASE 20 — PAYMENT ARCHITECTURE REVIEW

## Current State
| Component | Status |
|-----------|--------|
| Africa's Talking Sandbox | EXISTS — USSD integration |
| Payment Transaction model | EXISTS |
| Account Recharge | EXISTS |
| Wallet Payments | EXISTS |
| Order payments | EXISTS |

## Spec Requirements
> "Review entire payment lifecycle."

### Lifecycle Validation
| Flow | Steps to Validate |
|------|-------------------|
| B2C | Customer → Order → Payment → Escrow → Business → Settlement → Receipt |
| B2B | Business A → Purchase Request → Approval → Payment → Escrow → Business B → Confirmation → Settlement |
| Freelance | Client → Booking → Escrow → Worker Acceptance → Completion → Release Funds → Commission → Payout |

### Validation Checklist
| Concern | Check |
|---------|-------|
| Refunds | Full + partial refund flows |
| Chargebacks | Dispute → investigation → resolution |
| Cancellation | Order cancellation + payment reversal |
| Escrow timing | Hold period, auto-release rules |
| Settlement | Business payout scheduling |
| Notifications | Payment status change emails/push |
| Receipts | Auto-generated on completion |
| Audit records | Immutable payment history |

### Implementation Plan
- Audit all payment-related modules (payment-transaction, account-recharge, wallet, order, marketplace, freelance-service, freelance-order, token-transaction)
- Document current payment flows with diagrams
- Identify gaps between spec and implementation
- Fix any missing validations, edge cases, or audit gaps
- Output: **Payment Architecture Report**

---

# PHASE 21 — COMMERCE TESTING

## Spec Requirements
Comprehensive validation of all commerce flows.

### Test Matrix
| Area | Tests |
|------|-------|
| Offline Login | Worker offline auth → cached session → POS access → sync on reconnect |
| Offline Sales | Create sale offline → reconnect → sync → verify server state |
| Wallet | Recharge → balance update → spend → refund → audit trail |
| Payments | B2C checkout → escrow → settlement → receipt |
| Tokens | Purchase → spend → convert → refund → supply validation |
| Ledger | Every balance movement creates ledger entry |
| Escrow | Hold → release → dispute → resolution |
| B2B | Purchase request → approval → payment → fulfillment |
| B2C | Browse → cart → checkout → payment → delivery |
| Freelance | Post service → book → escrow → complete → payout |
| KYC | Submit → review → approve/reject → B2B gate |
| Subscriptions | Plan selection → feature gates → upgrade/downgrade |
| Admin Dashboard | Stats accuracy, user management, moderation |
| Marketplace | Search, filter, cart, checkout, type-specific experiences |
| Permissions | Role-based access: client, business, worker, admin |
| Responsive | Mobile, tablet, desktop layouts |
| Dark Mode | All pages consistent in dark mode |
| Security | OTP, password reset, session handling, offline restrictions |

### Deliverables
| Document | Content |
|----------|---------|
| Authentication Completion Report | Phase 13 summary, flows, security |
| Offline Worker Report | Phase 14 summary, credential caching, permission model |
| Platform Governance Report | Phase 15 admin dashboard, KYC pipeline |
| KYC Roadmap | Document types, status flow, B2B gate |
| Wallet Security Report | Audit findings, ledger pattern, atomic transactions |
| Token Audit | Precision, conversion, supply validation |
| Payment Audit | Lifecycle validation, escrow, settlement |
| B2B Readiness Report | Feature completion, verification gate |
| Subscription Roadmap | Plan tiers, feature gates, pricing |
| Commerce Completion Roadmap | Full feature matrix, completion status |
| Security Assessment | OWASP checklist, offline security, token security |
| Production Readiness Assessment | Performance, scalability, monitoring |
| Technical Debt Report | Known issues, deferred items, refactoring needs |
| Final USCOR 2.1 Assessment | Thesis alignment, feature coverage, ship readiness |

---

## Summary

| Phase | Scope | Estimated New Files | Estimated Modified Files |
|-------|-------|--------------------:|-------------------------:|
| **Phase 14** — Offline Login | Worker offline auth, encrypted caching, permission guards | 6 | 10 |
| **Phase 15** — Platform Admin | Dashboard stats, KYC pipeline, business/worker management | 8 | 5 |
| **Phase 16** — B2B Enablement | Wholesale pricing, purchase requests, vendor badges | 10 | 8 |
| **Phase 17** — Subscriptions | Architecture only, config + StatusBadge gates | 3 | 4 |
| **Phase 18** — Wallet Security | Ledger pattern, atomic transactions, audit logs | 4 | 6 |
| **Phase 19** — Token Review | Precision audit, reconciliation, Decimal.js | 2 | 8 |
| **Phase 20** — Payment Review | Lifecycle validation, flow diagrams, gap fixes | 2 | 10 |
| **Phase 21** — Commerce Testing | End-to-end validation, 14 deliverable reports | 14 | 0 |

**Total estimated:** ~49 new files, ~51 modified files across Phases 14-21

---

*Created: June 28, 2026*
*Author: Kambale Kiregha Ezechiel + Claude Code*
