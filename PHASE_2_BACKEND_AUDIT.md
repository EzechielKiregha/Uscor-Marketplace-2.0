# PHASE 2 — BACKEND AUDIT REPORT
## USCOR Marketplace 2.0 — Detailed Backend Analysis

---

## 1. MODULE-BY-MODULE AUDIT

### 1.1 Auth Module — COMPLETE | Minor Refactor
**Files:** auth.service.ts, auth.resolver.ts, auth.module.ts, signin.input.ts, auth-payload.entity.ts, jwt-auth.guard.ts, roles.guard.ts, roles.decorator.ts

**Issues Found:**
- **Repeated role-based if/else chains** in `auth.service.ts`:
  - `getUserRole()` (lines 20-49) — 4 sequential DB queries
  - `validateUser()` (lines 51-110) — 4 if/else blocks
  - `generateToken()` (lines 112-149) — 4 if/else blocks
  - `validateCurrentAccountJwt()` (lines 213-263) — 4 if/else blocks
- **Typo:** `"Acount not found"` (should be "Account")
- **Access token expiry is 1 day** — thesis specifies 15 minutes
- **No password strength validation**

**Refactor Recommendation:**
```typescript
// Create a generic helper:
private async findUserByRole(id: string, role: string) {
  const modelMap = {
    client: this.prisma.client,
    business: this.prisma.business,
    worker: this.prisma.worker,
    admin: this.prisma.admin,
  };
  const model = modelMap[role];
  if (!model) throw new UnauthorizedException("Invalid role");
  return model.findUnique({ where: { id } });
}
```

---

### 1.2 Sale Module — COMPLETE | Major Refactor Needed
**Files:** 12 files (service, resolver, 8 DTOs, 7 entities)

**Issues Found:**
1. **Duplicate `verifyStoreAccess()`** — Sale service has its own copy (lines 1732-1754) AND calls `this.storeService.verifyStoreAccess()`. The private copy uses `user.role === "ADMIN"` (uppercase) while the store service uses lowercase. **Bug potential.**

2. **Repeated include blocks** — The same Prisma include pattern is used 5+ times:
   ```
   store: { select: { id, name, address, createdAt } }
   worker: { select: { id, fullName, role } }
   client: { select: { id, fullName, email } }
   saleProducts: { include: { product: { select: ... } } }
   returns: { select: { id, reason, status, createdAt } }
   ```
   **Action:** Extract to `SALE_FULL_INCLUDE` constant.

3. **Puppeteer for receipt PDF** — `generateReceipt()` spawns a headless Chrome instance. This will **fail on Vercel/Railway serverless**. Replace with a lightweight PDF library (e.g., `@react-pdf/renderer` on client-side, or `pdfkit` server-side).

4. **Missing offline fields** — No `isOffline`, `syncStatus`, `localTimestamp`, `deviceId`, `version` on Sale model.

5. **Hardcoded tax rate** — Receipt HTML hardcodes `sale.totalAmount * 0.18` (18% VAT). Should be configurable per country.

6. **Sale total validation commented out** — Lines 168-169 and 451-452 have total amount validation commented out with `// throw new Error(...)`.

---

### 1.3 Worker Module — COMPLETE | Has Duplicate DTOs
**Files:** 16 DTOs, 8 entities, service, resolver, module

**Issues Found:**
1. **Duplicate DTOs with Sale module:**
   - `worker/dto/add-sale-product.input.ts` ↔ `sale/dto/add-sale-product.input.ts`
   - `worker/dto/create-sale.input.ts` ↔ `sale/dto/create-sale.input.ts`
   - `worker/dto/update-sale-product.input.ts` ↔ `sale/dto/update-sale-product.input.ts`

2. **Duplicate entities with Sale/Shift modules:**
   - `worker/entities/sale.entity.ts` ↔ `sale/entities/sale.entity.ts`
   - `worker/entities/sale-product.entity.ts` ↔ `sale/entities/sale-product.entity.ts`
   - `worker/entities/shift.entity.ts` ↔ `shift/entities/shift.entity.ts`

3. **Inline PagedResult types** in resolver (lines 40-98) — `SalesPagedResult`, `ShiftsPagedResult`, `InventoryPagedResult`, `ChatsPagedResult` are defined inline. Should use generic pagination.

**Refactor Recommendation:**
- Worker module should IMPORT from sale/shift modules instead of duplicating
- Create `common/entities/paginated-response.entity.ts`

---

### 1.4 Marketplace Module — PARTIAL | Needs Enhancement
**Files:** resolver (757 lines), service (empty!), module, 4 DTOs/entities

**Issues Found:**
1. **Empty service** — `marketplace.service.ts` is literally `export class MarketplaceService {}`. All logic lives in the resolver directly accessing Prisma.
2. **Massive promotion-matching code** repeated 3 times (lines 179-239, 252-318, 417-459). Same business → promotions mapping logic.
3. **Missing marketplace features from thesis:**
   - No featured stores query
   - No trending products (by sales volume)
   - No recommended products (by category/business type)
   - No recently viewed
   - No nearby businesses
   - No business-type-specific sections
   - No top sellers

**Refactor Recommendation:**
- Move all logic from resolver to service
- Extract `attachPromotions()` helper method
- Add new queries: `featuredStores`, `trendingProducts`, `businessTypeShowcase`

---

### 1.5 Inventory Module — COMPLETE | Good Quality
**Files:** service, resolver, module, 7 DTOs, 7 entities

**Assessment:**
- Purchase orders: COMPLETE
- Transfer orders: COMPLETE
- Inventory adjustments: COMPLETE
- Low stock alerts: COMPLETE (entity exists)
- Bulk import: COMPLETE (entity exists)
- Properly uses `verifyStoreAccess` from StoreService

**Minor Issue:** Import validation does N+1 queries (loops product checks). Should batch.

---

### 1.6 Business Module — COMPLETE | Well-Structured
**Files:** service, resolver, module, 2 DTOs, 7 entities

**Assessment:**
- Dashboard stats entity: COMPLETE
- Business clients query: COMPLETE
- Sales data points: COMPLETE
- Paginated businesses: COMPLETE
- KYC integration: COMPLETE

**No issues found.**

---

### 1.7 Store Module — COMPLETE | Good Quality
**Files:** service, resolver, module, 4 DTOs, 10 entities

**Assessment:**
- Store CRUD: COMPLETE
- Worker-to-store assignment: COMPLETE
- Store reports: COMPLETE
- Dashboard stats: COMPLETE
- Revenue/sales stats entities: COMPLETE
- `verifyStoreAccess()` is the canonical auth check — properly used by sale/inventory modules

**No issues found.**

---

### 1.8 Settings Module — COMPLETE | Has Duplicate DTO
**Files:** service, resolver, module, 7 DTOs, 5 entities

**Issues Found:**
1. **Duplicate DTO:** `settings/dto/update-business.input.ts` ↔ `business/dto/update-business.input.ts`
2. KYC document upload: COMPLETE
3. Payment config: COMPLETE
4. Hardware config: COMPLETE
5. Terms agreement: COMPLETE

---

### 1.9 Chat Module — COMPLETE | Typo
**Files:** service, pusher.service.ts, resolver, module, DTOs, entities

**Issues:**
1. **Typo in module name:** `chat-nessage` should be `chat-message`
2. Pusher integration: COMPLETE
3. Chat participants: COMPLETE

---

### 1.10 Post-Of-Sale Module — REFACTOR | Naming Confusion
**Assessment:** This module handles "PostOfSale" which is actually a **classified listing / P2P selling post**, NOT the Point-of-Sale (POS). Confusing name.

**Recommendation:** Rename to `classified-listing` or `p2p-listing` to avoid confusion with the POS system.

---

## 2. DUPLICATE CODE INVENTORY

### 2.1 Duplicate DTOs (5 pairs)
| File | Location 1 | Location 2 | Action |
|------|-----------|-----------|--------|
| `add-sale-product.input.ts` | `sale/dto/` | `worker/dto/` | MERGE → keep in `sale/dto/`, import in worker |
| `create-sale.input.ts` | `sale/dto/` | `worker/dto/` | MERGE → keep in `sale/dto/`, import in worker |
| `update-sale-product.input.ts` | `sale/dto/` | `worker/dto/` | MERGE → keep in `sale/dto/`, import in worker |
| `receipt.input.ts` | `sale/dto/` | `order/dto/` | KEEP SEPARATE — different contexts |
| `update-business.input.ts` | `business/dto/` | `settings/dto/` | MERGE → keep in `business/dto/`, import in settings |

### 2.2 Duplicate Entities (5 pairs)
| File | Location 1 | Location 2 | Action |
|------|-----------|-----------|--------|
| `sale.entity.ts` | `sale/entities/` | `worker/entities/` | INVESTIGATE — may have different fields per context |
| `sale-product.entity.ts` | `sale/entities/` | `worker/entities/` | INVESTIGATE — same |
| `shift.entity.ts` | `shift/entities/` | `worker/entities/` | INVESTIGATE — same |
| `chat.entity.ts` | `chat/entities/` | `worker/entities/` | INVESTIGATE — worker version is simplified |
| `order-product.entity.ts` | `order/entities/` | `order-product/entities/` | MERGE → keep in `order/entities/` |

**Note:** Some entity "duplicates" may be intentional — GraphQL code-first approach sometimes requires different ObjectType shapes for different resolvers. These should be investigated individually before merging.

### 2.3 Repeated Patterns
| Pattern | Occurrences | Recommended Fix |
|---------|-------------|-----------------|
| `verifyStoreAccess()` | 2 (store.service + sale.service) | Remove from sale.service, use store.service only |
| Paginated response types | 4+ inline definitions in worker.resolver | Create generic `PaginatedResponse<T>` |
| Sale include blocks | 5+ in sale.service | Extract `SALE_FULL_INCLUDE` constant |
| Promotion attachment logic | 3 in marketplace.resolver | Extract `attachPromotions()` helper |
| Role-based if/else chains | 4 in auth.service | Create `findUserByRole()` helper |
| Product validation loops | 3+ across sale/inventory | Batch validate with `findMany()` |

---

## 3. MISSING BACKEND FEATURES (Thesis Gap)

### 3.1 Offline Sync Support (HIGHEST PRIORITY)
**Required new endpoint/mutations:**
```graphql
mutation syncOfflineSales(input: [OfflineSaleInput!]!): SyncResult!
```
**Required Sale model changes:**
- `isOffline: Boolean`
- `syncStatus: SyncStatus` (PENDING_SYNC, SYNCED, CONFLICT, FAILED)
- `localTimestamp: DateTime`
- `deviceId: String`
- `version: Int` (optimistic locking)

### 3.2 Product Model Extensions
**Missing fields for business-type specialization:**
- `sku: String` — Standard product identifier
- `barcode: String` — Scanner integration
- `serialNumber: String?` — Electronics
- `imei: String?` — Electronics
- `warrantyMonths: Int?` — Electronics/Hardware
- `isbn: String?` — Bookstore
- `expiryDate: DateTime?` — Grocery
- `weight: Float?` — Hardware/Grocery
- `dimensions: Json?` — Hardware
- `businessTypeModifiers: Json?` — Already exists as `variants` but poorly named

### 3.3 Notification System
**Missing entirely.** Need:
- `Notification` model
- `notification.module.ts`
- Push notification service
- In-app notification queries/subscriptions

### 3.4 Report Generation
**Current state:** Receipt generation uses Puppeteer (broken on serverless).
**Needed:**
- Client-side PDF generation (move to frontend)
- CSV/Excel export endpoints
- Shift summary report query
- Daily closing report query
- Inventory valuation report query

### 3.5 Marketplace Enhancements
**Missing queries:**
- `featuredStores(limit)` — Verified businesses with highest sales
- `trendingProducts(period, limit)` — Products with most sales in period
- `recommendedProducts(businessType, limit)` — Category/type-based recommendations
- `recentlyViewedProducts(clientId)` — Requires new RecentView model
- `nearbyBusinesses(lat, lng, radius)` — Requires geolocation fields on Store
- `businessTypeShowcase(type, limit)` — Products grouped by business type
- `topSellers(period, limit)` — Businesses ranked by revenue

---

## 4. SECURITY AUDIT

| Issue | Severity | File | Action |
|-------|----------|------|--------|
| CSRF disabled | HIGH | app.module.ts:58 | Enable `csrfPrevention: true` |
| No rate limiting | HIGH | — | Add `@nestjs/throttler` |
| No input validation decorators | MEDIUM | Most DTOs | Add `class-validator` decorators |
| Access token expires in 1 day | MEDIUM | auth.service.ts:144 | Change to 15 minutes per thesis |
| Hardcoded 18% tax | LOW | sale.service.ts:1685 | Make configurable per country |
| Console.log in production | LOW | Multiple files | Remove or use Logger |
| Commented-out validation | LOW | sale.service.ts:168,451 | Uncomment or remove |
| `any` type usage | LOW | Multiple files | Add proper types |

---

## 5. PERFORMANCE CONCERNS

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| N+1 product validation | sale.service.ts:126-139 | Slow for large carts | Batch with `findMany({ where: { id: { in: ids } } })` |
| N+1 top products query | sale.service.ts:2000-2012 | Slow dashboard | Use join or include |
| Full product fetch without filters | marketplace.resolver.ts:149-176 | Returns ALL products | Always paginate, cap limit |
| Promotion matching 3x repeated | marketplace.resolver.ts | Code bloat, maintenance | Extract helper |
| No database connection pooling config | prisma.service.ts | Connection exhaustion | Configure pool size |

---

## 6. PROPOSED COMMON MODULE ADDITIONS

### `/common/dto/`
```
pagination.input.ts      — PaginationInput { page, limit, sort, order }
filter.input.ts          — DateRangeFilter { startDate, endDate }
success.dto.ts           — Already exists ✓
```

### `/common/entities/`
```
paginated-response.ts    — Generic PaginatedResponse<T> { items, total, page, limit }
delete-response.ts       — DeleteResponse { id, success }
```

### `/common/helpers/`
```
store-access.helper.ts   — Canonical verifyStoreAccess()
promotion.helper.ts      — attachPromotions() extracted from marketplace
user-lookup.helper.ts    — findUserByRole() extracted from auth
```

### `/common/constants/`
```
includes.ts              — SALE_FULL_INCLUDE, PRODUCT_FULL_INCLUDE, etc.
```

---

## 7. SUMMARY SCORECARD

| Area | Score | Notes |
|------|-------|-------|
| **Module Coverage** | 9/10 | All thesis modules implemented |
| **Code Quality** | 6/10 | Significant duplication, inline types |
| **Schema Completeness** | 7/10 | Missing offline + business-type fields |
| **Security** | 5/10 | CSRF off, no rate limit, weak token expiry |
| **Performance** | 6/10 | N+1 queries, no pagination caps |
| **Maintainability** | 5/10 | Duplicate DTOs/entities, no shared abstractions |
| **Thesis Alignment** | 7/10 | Core features present, offline/vertical gaps |
| **Production Readiness** | 4/10 | Puppeteer dependency, missing validation |

**Overall Backend Grade: 6.1/10** — Strong feature coverage but needs refactoring for production quality.

---

*Audit completed: Phase 2 — Backend Audit*
*Next: Phase 3 — Offline-First Architecture Design (HIGHEST PRIORITY)*
*Source of truth: Final Year Thesis by Kambale Kiregha Ezechiel, June 2026*
