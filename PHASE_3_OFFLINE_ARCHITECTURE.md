# PHASE 3 — OFFLINE-FIRST ARCHITECTURE PLAN
## USCOR's Flagship Capability — Complete Design Document

---

## 1. CURRENT STATE ASSESSMENT

### What Exists
| Component | File | State |
|-----------|------|-------|
| Service Worker (Serwist) | `app/sw.ts` | Basic precaching + offline fallback page |
| SW Config | `next.config.ts` | Serwist configured, disabled in dev |
| Manifest | `app/manifest.ts` | PWA manifest with icons |
| Offline Page | `app/~offline/page.tsx` | Renders `<h1>You are offline</h1>` — no functionality |
| IndexedDB Schema | `lib/indexed-db.ts` | 5 stores defined (offlineOperations, workerCache, localSales, localInventory, localChat) |
| IndexedDB Hook | `hooks/use-indexed-db.ts` | Full CRUD + sync + online/offline detection |
| POS Page | `worker/_components/PosPage.tsx` | Imports `useIndexedDB` but only uses `isOnline` for a banner |
| Apollo Client | `lib/apollo-client.ts` | Standard HTTP link, no offline link |
| useSales Hook | `business/_hooks/use-sales.ts` | 100% online — all mutations go directly to GraphQL |

### What's Missing
1. **IndexedDB not connected to POS flow** — `useIndexedDB` is imported but `saveLocalSale`, `saveOfflineOperation`, `getPendingOperations` are NEVER called
2. **No offline mutation queue** — When offline, mutations simply fail silently
3. **No sync engine** — `syncOfflineOperations()` exists but receives no GraphQL mutation references
4. **No conflict resolution** — No timestamp comparison, no version checking
5. **No sync status UI** — No pending count, no sync progress, no conflict alerts
6. **Service worker only caches pages** — No GraphQL response caching, no product catalog caching
7. **Sale model has no offline fields** — No isOffline, syncStatus, deviceId, localTimestamp

---

## 2. ARCHITECTURE DESIGN

### 2.1 Data Flow (Thesis-Aligned)

```
Worker Creates Sale
        ↓
  ┌─────────────────┐
  │ Network Check    │
  └────┬───────┬─────┘
       │       │
    ONLINE   OFFLINE
       │       │
       ↓       ↓
  ┌─────────┐ ┌──────────────┐
  │ GraphQL │ │ IndexedDB    │
  │ Mutation│ │ Local Store  │
  └────┬────┘ └──────┬───────┘
       │             │
       ↓             ↓
  ┌─────────┐ ┌──────────────┐
  │ Server  │ │ Offline Queue│
  │ Confirms│ │ (PENDING)    │
  └────┬────┘ └──────┬───────┘
       │             │
       ↓             │ (Reconnect)
  ┌─────────┐        │
  │ Update  │←───────┘
  │ UI      │  Background Sync
  └─────────┘
```

### 2.2 IndexedDB Store Schema (Enhanced)

```typescript
// EXISTING STORES (keep as-is):
offlineOperations  // Queue for pending mutations
workerCache        // General cache for worker data
localSales         // Full sale objects stored locally
localInventory     // Cached product catalog
localChat          // Offline chat messages

// NEW STORES to add:
syncMetadata       // Track last sync time, device ID, sync status
conflictLog        // Store conflicts for manual resolution
```

### 2.3 Offline Operation Types

```typescript
interface OfflineOperation {
  id: string;                    // UUID generated client-side
  type: OfflineOperationType;
  payload: any;                  // Serialized mutation variables
  timestamp: string;             // ISO timestamp (conflict resolution)
  deviceId: string;              // Browser fingerprint
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  retryCount: number;
  maxRetries: number;            // Default: 3
  error?: string;
  syncedAt?: string;
  serverResponse?: any;
}

type OfflineOperationType =
  | 'CREATE_SALE'
  | 'ADD_SALE_PRODUCT'
  | 'UPDATE_SALE_PRODUCT'
  | 'REMOVE_SALE_PRODUCT'
  | 'COMPLETE_SALE'
  | 'CREATE_RETURN'
  | 'INVENTORY_ADJUSTMENT'
  | 'CLOCK_IN'
  | 'CLOCK_OUT';
```

---

## 3. IMPLEMENTATION PLAN

### 3.1 STEP 1: Prisma Schema Changes

Add offline fields to the Sale model:

```prisma
model Sale {
  // ... existing fields ...

  // NEW: Offline support fields
  isOffline        Boolean        @default(false)
  syncStatus       SyncStatus     @default(SYNCED)
  localId          String?        // Client-side UUID for dedup
  localTimestamp    DateTime?      // Client-side creation time
  deviceId         String?        // Terminal/device identifier
  version          Int            @default(1)  // Optimistic locking
}

enum SyncStatus {
  SYNCED
  PENDING_SYNC
  SYNCING
  FAILED
  CONFLICT
}
```

Add SKU/barcode to Product for offline lookup:

```prisma
model Product {
  // ... existing fields ...

  // NEW: Offline + scanning support
  sku              String?        @unique
  barcode          String?
  serialNumber     String?        // Electronics
  imei             String?        // Electronics
  warrantyMonths   Int?           // Electronics/Hardware

  @@index([sku])
  @@index([barcode])
}
```

### 3.2 STEP 2: Backend — Batch Sync Endpoint

New GraphQL mutation for syncing offline sales:

```graphql
input OfflineSaleInput {
  localId: String!
  storeId: String!
  workerId: String!
  clientId: String
  totalAmount: Float!
  discount: Float!
  paymentMethod: String!
  localTimestamp: DateTime!
  deviceId: String!
  saleProducts: [SaleProductInput!]!
}

type SyncResultItem {
  localId: String!
  serverId: String
  status: String!      # SYNCED | CONFLICT | FAILED
  error: String
  conflictDetails: String
}

type SyncResult {
  synced: Int!
  failed: Int!
  conflicts: Int!
  results: [SyncResultItem!]!
}

mutation syncOfflineSales(sales: [OfflineSaleInput!]!): SyncResult!
```

**Conflict Resolution Strategy (Last-Write-Wins with Flagging):**

```
For each offline sale:
  1. Check if localId already exists in DB → SKIP (dedup)
  2. Check product quantities:
     a. If sufficient → CREATE sale, mark SYNCED
     b. If insufficient → Flag CONFLICT, store details
  3. Update inventory atomically
  4. Return per-item results
```

### 3.3 STEP 3: Frontend — Enhanced Offline Hook

Replace the current `useIndexedDB` + `useSales` pattern with a unified `useOfflinePOS` hook:

```typescript
// hooks/use-offline-pos.ts

export function useOfflinePOS(storeId: string, workerId: string) {
  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Core POS operations (work online AND offline)
  async function createSale(input) {
    if (isOnline) {
      // Direct GraphQL mutation
      return await createSaleMutation({ variables: { input } });
    } else {
      // Save to IndexedDB
      const localSale = {
        id: crypto.randomUUID(),
        localId: crypto.randomUUID(),
        ...input,
        localTimestamp: new Date().toISOString(),
        deviceId: getDeviceId(),
        status: 'OPEN',
        syncStatus: 'PENDING_SYNC',
      };
      await saveToIndexedDB('localSales', localSale);
      await saveToIndexedDB('offlineOperations', {
        id: crypto.randomUUID(),
        type: 'CREATE_SALE',
        payload: localSale,
        timestamp: localSale.localTimestamp,
        deviceId: localSale.deviceId,
        status: 'PENDING',
        retryCount: 0,
        maxRetries: 3,
      });
      await updatePendingCount();
      return localSale;
    }
  }

  async function addProductToSale(saleId, productId, quantity, modifiers?) {
    if (isOnline) {
      return await addSaleProductMutation({ ... });
    } else {
      // Get cached product for price
      const product = await getFromIndexedDB('localInventory', productId);
      // Update local sale
      const sale = await getFromIndexedDB('localSales', saleId);
      sale.saleProducts.push({ productId, quantity, price: product.price, modifiers });
      sale.totalAmount += product.price * quantity;
      await saveToIndexedDB('localSales', sale);
      // Queue operation
      await saveToIndexedDB('offlineOperations', {
        id: crypto.randomUUID(),
        type: 'ADD_SALE_PRODUCT',
        payload: { saleId, productId, quantity, modifiers },
        ...commonFields(),
      });
      await updatePendingCount();
      return sale;
    }
  }

  async function completeSale(saleId, paymentMethod) {
    if (isOnline) {
      return await completeSaleMutation({ ... });
    } else {
      const sale = await getFromIndexedDB('localSales', saleId);
      sale.status = 'COMPLETED';
      sale.paymentMethod = paymentMethod;
      await saveToIndexedDB('localSales', sale);
      await saveToIndexedDB('offlineOperations', {
        id: crypto.randomUUID(),
        type: 'COMPLETE_SALE',
        payload: { saleId, paymentMethod },
        ...commonFields(),
      });
      await updatePendingCount();
      return sale;
    }
  }

  // Background sync engine
  async function syncPendingOperations() {
    if (!isOnline || syncStatus === 'syncing') return;
    setSyncStatus('syncing');

    const pending = await getPendingOperations();
    if (pending.length === 0) {
      setSyncStatus('idle');
      return;
    }

    // Group CREATE_SALE operations for batch sync
    const salesToSync = pending
      .filter(op => op.type === 'CREATE_SALE')
      .map(op => op.payload);

    if (salesToSync.length > 0) {
      const result = await syncOfflineSalesMutation({
        variables: { sales: salesToSync }
      });

      // Process results
      for (const item of result.data.syncOfflineSales.results) {
        if (item.status === 'SYNCED') {
          await markOperationSynced(item.localId);
          await removeFromIndexedDB('localSales', item.localId);
        } else if (item.status === 'CONFLICT') {
          await markOperationConflict(item.localId, item.conflictDetails);
          setConflicts(prev => [...prev, item]);
        }
      }
    }

    // Process other operation types sequentially
    for (const op of pending.filter(o => o.type !== 'CREATE_SALE')) {
      await processOperation(op);
    }

    setLastSyncTime(new Date());
    await updatePendingCount();
    setSyncStatus('idle');
  }

  // Auto-sync on reconnect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingOperations();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic sync every 30 seconds when online
    const interval = setInterval(() => {
      if (navigator.onLine) syncPendingOperations();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Cache product catalog on mount for offline lookup
  useEffect(() => {
    if (isOnline && storeId) {
      cacheProductCatalog(storeId);
    }
  }, [storeId, isOnline]);

  return {
    isOnline,
    pendingCount,
    syncStatus,
    lastSyncTime,
    conflicts,
    createSale,
    addProductToSale,
    completeSale,
    syncPendingOperations,
    resolveConflict,
    getLocalSales,        // For displaying offline sales
    getCachedProducts,    // For product lookup when offline
  };
}
```

### 3.4 STEP 4: Sync Status UI Component

```typescript
// components/SyncStatusBar.tsx

export function SyncStatusBar({
  isOnline,
  pendingCount,
  syncStatus,
  lastSyncTime,
  onSyncNow,
}: SyncStatusBarProps) {
  if (isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Wifi className="h-4 w-4" />
        <span>Connected • All synced</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200
                      dark:border-amber-800 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Offline Mode
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {pendingCount} pending operation{pendingCount !== 1 ? 's' : ''} •
              Sales continue working •
              Last sync {formatRelativeTime(lastSyncTime)}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-300 text-amber-700">
          {pendingCount} pending
        </Badge>
      </div>
    );
  }

  // Online but has pending operations
  if (syncStatus === 'syncing') {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Syncing {pendingCount} operations...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-orange-600">
      <CloudUpload className="h-4 w-4" />
      <span>{pendingCount} pending</span>
      <button onClick={onSyncNow} className="underline">Sync now</button>
    </div>
  );
}
```

### 3.5 STEP 5: Product Catalog Caching

```typescript
// lib/catalog-cache.ts

export async function cacheProductCatalog(storeId: string) {
  // Fetch all products for the store
  const { data } = await client.query({
    query: GET_STORE_PRODUCTS_FOR_CACHE,
    variables: { storeId },
    fetchPolicy: 'network-only',
  });

  const db = await initDB();
  const tx = db.transaction('localInventory', 'readwrite');

  // Clear old cache for this store
  const allItems = await tx.store.getAll();
  for (const item of allItems) {
    if (item.storeId === storeId) {
      await tx.store.delete(item.id);
    }
  }

  // Cache all products
  for (const product of data.products) {
    await tx.store.put({
      id: product.id,
      storeId,
      title: product.title,
      price: product.price,
      quantity: product.quantity,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      medias: product.medias,
      cachedAt: new Date().toISOString(),
    });
  }

  await tx.done;

  // Save sync metadata
  await saveToIndexedDB('syncMetadata', {
    key: `catalog_${storeId}`,
    lastSynced: new Date().toISOString(),
    productCount: data.products.length,
  });
}
```

### 3.6 STEP 6: Enhanced Service Worker

```typescript
// app/sw.ts — ENHANCED

import { defaultCache } from "@serwist/turbopack/worker";
import { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // Cache GraphQL catalog queries
    {
      urlPattern: /\/graphql/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'graphql-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 3600, // 1 hour
        },
      },
    },
    // Cache product images
    {
      urlPattern: /\.public\.blob\.vercel-storage\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'product-images',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 86400 * 7, // 7 days
        },
      },
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Background Sync Registration
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-sales') {
    event.waitUntil(syncFromServiceWorker());
  }
});

// Periodic Background Sync (where supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncFromServiceWorker());
  }
});

async function syncFromServiceWorker() {
  // Post message to client to trigger sync
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: 'TRIGGER_SYNC' });
  }
}

serwist.addEventListeners();
```

### 3.7 STEP 7: Apollo Client Offline Link

```typescript
// lib/apollo-client.ts — ENHANCED

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

// Add retry link for network failures
const retryLink = new RetryLink({
  delay: {
    initial: 1000,
    max: 30000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error) => {
      // Retry on network errors, not on GraphQL errors
      return !!error && !error.result;
    },
  },
});

// Offline detection link
const offlineLink = new ApolloLink((operation, forward) => {
  if (!navigator.onLine) {
    // For queries: try to serve from cache
    if (operation.query.definitions.some(
      (d: any) => d.operation === 'query'
    )) {
      return forward(operation);
    }
    // For mutations: the useOfflinePOS hook handles queueing
    // This link just prevents the request from being sent
    return new Observable((observer) => {
      observer.error(new Error('OFFLINE_MUTATION'));
    });
  }
  return forward(operation);
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, offlineLink, retryLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Show cached data while fetching
    },
  },
});
```

---

## 4. CONFLICT RESOLUTION STRATEGY

### 4.1 Rules (Thesis-Aligned: Last-Write-Wins with Flagging)

```
RULE 1: DEDUPLICATION
  - Every offline sale gets a `localId` (UUID)
  - Server checks: does this localId already exist?
  - If yes → SKIP (already synced in a previous attempt)

RULE 2: INVENTORY CHECK
  - For each sale product, check current server quantity
  - If quantity >= requested → ALLOW
  - If quantity < requested but > 0 → PARTIAL CONFLICT
    → Reduce quantity to available, flag for review
  - If quantity = 0 → FULL CONFLICT
    → Reject this line item, flag for review

RULE 3: TIMESTAMP ORDERING
  - When two terminals sell the same product offline:
    → Sort by localTimestamp (earliest first)
    → First sale gets priority
    → Second sale gets CONFLICT status if insufficient stock

RULE 4: MANAGER RESOLUTION
  - Conflicts appear in Business Dashboard → "Sync Conflicts" section
  - Manager can: Accept (adjust inventory), Reject (void sale), Modify
```

### 4.2 Conflict UI (Worker)

```
┌─────────────────────────────────────────────┐
│ ⚠️ Sync Conflict                            │
│                                             │
│ Sale #abc123 (created offline 5 min ago)     │
│                                             │
│ Product: Samsung Galaxy A54                 │
│ Requested: 3 units                          │
│ Available: 1 unit                           │
│                                             │
│ Another terminal sold 2 units while you     │
│ were offline.                               │
│                                             │
│ [Adjust to 1 unit]  [Cancel sale]  [Flag]   │
└─────────────────────────────────────────────┘
```

---

## 5. OFFLINE CAPABILITIES BY OPERATION

| Operation | Offline Support | Storage | Sync Strategy |
|-----------|----------------|---------|---------------|
| **Create Sale** | YES | localSales + offlineOperations | Batch sync on reconnect |
| **Add Product to Sale** | YES | Update localSale | Part of sale sync |
| **Remove Product from Sale** | YES | Update localSale | Part of sale sync |
| **Complete Sale (Cash)** | YES | Mark COMPLETED locally | Sync on reconnect |
| **Complete Sale (Mobile Money)** | NO | Requires network for USSD | Queue, process on reconnect |
| **Complete Sale (Token)** | NO | Requires balance check | Queue, process on reconnect |
| **Inventory Adjustment** | YES | localInventory + offlineOperations | Individual sync |
| **Clock In/Out** | YES | offlineOperations | Individual sync |
| **Customer Lookup** | YES (cached) | workerCache | Read from cache |
| **Product Search** | YES (cached) | localInventory | Read from cache |
| **Receipt Generation** | YES (client-side) | Generate PDF locally | Upload on reconnect |
| **View Sales History** | YES (cached) | localSales + workerCache | Read from cache |
| **Transfer Orders** | NO | Requires multi-store coordination | Online only |
| **B2B Procurement** | NO | Requires verified network | Online only |

---

## 6. TESTING SCENARIOS

### 6.1 Offline Sales Flow
```
1. Worker clocks in (online)
2. Worker creates sale, adds 3 products
3. Network disconnects
4. Worker completes sale (cash) — saved locally
5. Worker creates another sale, adds 2 products
6. Worker completes sale (cash) — saved locally
7. Worker sees: "2 pending operations" in status bar
8. Network reconnects
9. Background sync triggers
10. Both sales sync successfully
11. Status bar shows: "Connected • All synced"
12. Inventory updated on server
```

### 6.2 Conflict Resolution
```
1. Terminal A (offline): Sells 3 units of Product X (stock: 5)
2. Terminal B (offline): Sells 4 units of Product X (stock: 5)
3. Terminal A reconnects first → Sale synced (stock: 2)
4. Terminal B reconnects → CONFLICT: requested 4, only 2 available
5. Worker sees conflict notification
6. Manager adjusts: sells 2 units, flags 2 as backorder
```

### 6.3 Deduplication
```
1. Worker creates sale offline
2. Network comes back briefly, sync starts
3. Network drops mid-sync
4. Network comes back again, sync retries
5. Server uses localId to detect duplicate → SKIP
6. No double sale created
```

### 6.4 Extended Offline Period
```
1. Worker operates offline for full 8-hour shift
2. Creates 47 sales
3. Makes 12 inventory adjustments
4. Clocks out
5. Network restored next morning
6. All 47 sales sync in batch
7. Inventory reconciled
8. Shift record updated
```

---

## 7. IMPLEMENTATION FILE CHANGES

### Backend (4 files to modify, 2 to create)

| File | Action | Changes |
|------|--------|---------|
| `prisma/schema.prisma` | MODIFY | Add SyncStatus enum, offline fields to Sale, SKU/barcode to Product |
| `sale/sale.service.ts` | MODIFY | Add `syncOfflineSales()` method |
| `sale/sale.resolver.ts` | MODIFY | Add `syncOfflineSales` mutation |
| `sale/dto/sync-offline-sales.input.ts` | CREATE | OfflineSaleInput, SyncResult DTOs |
| `sale/entities/sync-result.entity.ts` | CREATE | SyncResult, SyncResultItem entities |
| `product/dto/create-product.input.ts` | MODIFY | Add sku, barcode, serialNumber fields |

### Frontend (6 files to modify, 5 to create)

| File | Action | Changes |
|------|--------|---------|
| `hooks/use-offline-pos.ts` | CREATE | Unified offline POS hook |
| `lib/indexed-db.ts` | MODIFY | Add syncMetadata + conflictLog stores, enhance schema |
| `lib/catalog-cache.ts` | CREATE | Product catalog caching utility |
| `lib/device-id.ts` | CREATE | Device fingerprint generation |
| `lib/apollo-client.ts` | MODIFY | Add RetryLink + offline detection |
| `components/SyncStatusBar.tsx` | CREATE | Sync status indicator component |
| `components/ConflictResolver.tsx` | CREATE | Conflict resolution dialog |
| `app/sw.ts` | MODIFY | Add GraphQL caching + background sync |
| `app/(worker)/worker/_components/PosPage.tsx` | MODIFY | Use `useOfflinePOS` instead of `useSales` |
| `app/~offline/page.tsx` | MODIFY | Rich offline page with POS access |
| `graphql/sales.gql.ts` | MODIFY | Add SYNC_OFFLINE_SALES mutation |

---

## 8. MIGRATION STRATEGY

### Phase 3a: Schema + Backend (Sprint 1, Week 1-2)
1. Add Prisma schema changes (SyncStatus, offline fields, SKU/barcode)
2. Run migration
3. Implement `syncOfflineSales` service method
4. Add GraphQL mutation
5. Test with manual curl/Postman calls

### Phase 3b: Frontend Core (Sprint 1, Week 2-3)
1. Create `useOfflinePOS` hook
2. Create `SyncStatusBar` component
3. Enhance `lib/indexed-db.ts` with new stores
4. Create `lib/catalog-cache.ts`
5. Wire POS page to use new hook
6. Test: create sale online → verify same behavior

### Phase 3c: Offline Flow (Sprint 1, Week 3-4)
1. Implement offline sale creation path in `useOfflinePOS`
2. Implement product catalog caching
3. Implement background sync engine
4. Create conflict resolution UI
5. Enhance service worker with GraphQL caching
6. Test: full offline → reconnect → sync flow

### Phase 3d: Hardening (Sprint 2, Week 1)
1. Deduplication testing
2. Multi-terminal conflict testing
3. Extended offline period testing
4. Error recovery testing
5. Performance optimization (batch size, sync interval)
6. Offline receipt generation (client-side PDF)

---

## 9. SUCCESS METRICS (Thesis KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Zero data loss during outages | 100% | Count synced vs created |
| Transaction continuity | Uninterrupted | POS usable offline |
| Sync time after reconnect | < 30 seconds for 50 sales | Stopwatch test |
| Conflict detection accuracy | 100% | Unit tests |
| Worker awareness of status | Always visible | UI review |
| Average monthly offline hours handled | 12+ hours (thesis baseline) | Deployment logs |

---

*Design completed: Phase 3 — Offline-First Architecture*
*This is USCOR's flagship capability and highest implementation priority.*
*Next: Phase 4 — Business Type Experiences (Electronics & Hardware first)*
*Source of truth: Final Year Thesis by Kambale Kiregha Ezechiel, June 2026*
