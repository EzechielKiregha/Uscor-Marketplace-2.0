# PHASE 5 — MARKETPLACE REDESIGN PLAN
## Modern Commerce Experience — Inspired by Shopify, Linear, Stripe

---

## 1. CURRENT STATE ASSESSMENT

### What Exists
| Component | State | Issues |
|-----------|-------|--------|
| Marketplace page (`/marketplace`) | ~800 lines | Monolithic, hardcoded business types/categories, good filter system |
| Sticky search + collapsible filters | GOOD | Well-designed, responsive, rounded-xl style |
| Product/Service tabs | GOOD | Toggle between products and services |
| Grid/List view toggle | GOOD | Works on mobile and desktop |
| ProductCard | COMPLETE | Promotion badges, verified badges, B2B badges, cart integration |
| ServiceCard | EXISTS | Basic freelance service card |
| ProductDetailsModal | COMPLETE | Image gallery, variants, qty selector, chat integration |
| SearchModal | EXISTS | Dedicated search overlay |
| Pagination | BASIC | Previous/Next only, no page numbers |
| Business type filter | GOOD | All 10 types as dropdown |
| Category filter | GOOD | Dynamic categories from GraphQL |
| Price range filter | GOOD | Min/Max inputs |
| Sort options | GOOD | Relevance, Price, Rating, Newest |
| Quick filters (On Sale, Featured) | GOOD | Toggle buttons |
| Empty states | GOOD | Icon + message + clear filters CTA |

### What's Missing (Thesis Requirements)
| Feature | Status |
|---------|--------|
| Business-type showcase sections | MISSING — flat product grid only |
| Featured stores section | MISSING |
| Trending products section | MISSING |
| Recommended products | MISSING |
| Recently viewed | MISSING |
| Popular categories with icons | MISSING |
| Electronics showcase | MISSING |
| Hardware showcase | MISSING (separate static page exists) |
| Bookstore showcase | MISSING |
| Service showcase | MISSING |
| Nearby businesses | MISSING (no geolocation) |
| Suggested businesses | MISSING |
| Top sellers | MISSING |
| Better search experience | PARTIAL — modal exists but basic |
| Horizontal scrolling categories | MISSING |
| Skeleton loaders | MISSING — uses full-page Loader |
| Improved loading states | MISSING |

### Landing Page Assessment
| Component | State | Notes |
|-----------|-------|-------|
| HeaderComponent | COMPLETE | Has auth-aware navigation |
| HeroSection | COMPLETE | Animated hero with CTA |
| FeaturesSection | COMPLETE | Platform feature cards |
| MarqueeScroller | COMPLETE | Logo scroller |
| PricingSection | COMPLETE | Pricing tiers |
| TeamSection | COMPLETE | Team member cards |
| TestimonialSection | COMPLETE | User testimonials |
| FooterSection | COMPLETE | Full footer |
| Landing → Marketplace connection | WEAK | No featured products from real data |

---

## 2. REDESIGNED MARKETPLACE LAYOUT

### 2.1 Homepage Marketplace View (No Filters Active)

When a user lands on `/marketplace` with no filters, show a rich commerce experience:

```
┌────────────────────────────────────────────────────────────┐
│  🔍 Search Bar (Sticky)                    [Filters] [Grid]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ── Horizontal Category Scroll ──                         │
│  [🔌 Electronics] [🔨 Hardware] [📚 Books] [☕ Cafe] ...  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ⭐ Featured Products                          View All → │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │      │ │      │ │      │ │      │ │      │  ← Scroll  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔌 Electronics & Gadgets                      View All → │
│  Blue-tinted section background                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │Phone │ │Laptop│ │Earbuds│ │Tablet│                     │
│  │Brand │ │128GB │ │Warr.  │ │Model │  ← Type-specific   │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔨 Hardware & Tools                           View All → │
│  Orange-tinted section background                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │Drill │ │Cement│ │Pipes │ │Tools │                     │
│  │MOQ:10│ │Bulk$ │ │Weight│ │Brand │  ← Type-specific   │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🏪 Featured Stores                           View All → │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │ Think Big    │ │ Kigali Books│ │ Café Bloom  │         │
│  │ ✅ Verified  │ │ 📚 Bookstore│ │ ☕ Cafe     │         │
│  │ ⭐ 4.8      │ │ ⭐ 4.5      │ │ ⭐ 4.7      │         │
│  │ 234 products│ │ 89 products │ │ 45 products │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📚 Bookstore & Stationery                     View All → │
│  Emerald-tinted section background                        │
│  ...                                                       │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🎯 Browse All Products                                    │
│  [Product Grid with full pagination]                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 2.2 Filtered View (Active Filters)

When any filter is active, switch to the current flat grid layout (already works well):

```
┌────────────────────────────────────────────────────────────┐
│  🔍 Search: "Samsung"               [Filters ✓] [Grid]    │
├────────────────────────────────────────────────────────────┤
│  Showing 24 products matching "Samsung"                    │
│                                                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │      │ │      │ │      │ │      │                     │
│  │      │ │      │ │      │ │      │                     │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │      │ │      │ │      │ │      │                     │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│                                                            │
│  ◀ 1 2 3 4 5 ... 12 ▶                                    │
└────────────────────────────────────────────────────────────┘
```

---

## 3. NEW COMPONENTS TO CREATE

### 3.1 HorizontalCategoryScroll

```typescript
// components/marketplace/HorizontalCategoryScroll.tsx

// Horizontally scrollable business type pills
// Each pill: icon + label, clickable → sets businessType filter
// Active state with orange highlight
// Touch-friendly with momentum scroll
// Shows on mobile as single row, desktop as two rows
```

### 3.2 FeaturedProductsCarousel

```typescript
// components/marketplace/FeaturedProductsCarousel.tsx

// Horizontal scroll of featured products (product.featured === true)
// Uses Swiper.js (already in deps) for smooth carousel
// Shows 2 on mobile, 4 on tablet, 5 on desktop
// Auto-advance every 5 seconds
// Each card is a compact ProductCard variant
```

### 3.3 BusinessTypeShowcase

```typescript
// components/marketplace/BusinessTypeShowcase.tsx

// Section per business type with:
// - Type-colored background tint
// - Icon + title + description
// - "View All →" link
// - 4 products in grid (2 on mobile)
// - Type-specific product card rendering
// Already designed in Phase 4
```

### 3.4 FeaturedStoresSection

```typescript
// components/marketplace/FeaturedStoresSection.tsx

// Horizontal scroll of top/verified business cards
// Each card: avatar, name, type badge, verified badge, product count, rating
// Click → navigate to /b-view/[businessId]
// Query: businesses ordered by totalSales DESC, isVerified === true
```

### 3.5 ProductCardSkeleton

```typescript
// components/marketplace/ProductCardSkeleton.tsx

// Shimmer loading placeholder matching ProductCard layout:
// - Image placeholder (h-72 shimmer)
// - Business info shimmer
// - Title shimmer
// - Price shimmer
// - Button shimmer row
// Grid and list variants
```

### 3.6 EnhancedPagination

```typescript
// components/marketplace/EnhancedPagination.tsx

// Page numbers (1, 2, 3, ..., last)
// Ellipsis for large page counts
// Current page highlighted
// Previous/Next with keyboard shortcuts
// "Showing X-Y of Z results" text
// Jump-to-page input for large datasets
```

---

## 4. BACKEND QUERIES NEEDED

### 4.1 New GraphQL Queries

```graphql
# Featured products (already have featured field, just need query)
query featuredProducts($limit: Int) {
  marketplaceProducts(isFeatured: true, limit: $limit) {
    items { ...ProductFields }
  }
}

# Products grouped by business type (for showcase sections)
query productsByBusinessType($businessType: String!, $limit: Int) {
  marketplaceProducts(businessType: $businessType, limit: $limit) {
    items { ...ProductFields }
  }
}

# Featured/verified stores
query featuredStores($limit: Int) {
  featuredStores(limit: $limit) {
    id name avatar businessType kycStatus isVerified
    totalSales totalProductsSold
    _count { products }
  }
}

# Trending products (by sales in last 7 days)
query trendingProducts($period: String, $limit: Int) {
  trendingProducts(period: $period, limit: $limit) {
    items { ...ProductFields }
    salesCount
  }
}
```

### 4.2 Backend Service Additions (marketplace.service.ts)

```typescript
// Move all logic from marketplace.resolver.ts INTO the service

class MarketplaceService {
  // Existing (move from resolver)
  async getProducts(filters) { ... }
  async searchMarketplace(query) { ... }

  // NEW
  async getFeaturedStores(limit: number) {
    return this.prisma.business.findMany({
      where: { isVerified: true, kycStatus: 'VERIFIED' },
      orderBy: { totalProductsSold: 'desc' },
      take: limit,
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async getTrendingProducts(period: string, limit: number) {
    // Aggregate SaleProduct by productId in last 7/30 days
    // Return products ordered by total quantity sold
  }

  async getProductsByType(businessType: string, limit: number) {
    return this.prisma.product.findMany({
      where: { business: { businessType } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { /* standard product include */ },
    });
  }

  // Extract repeated promotion logic
  async attachPromotions(products: Product[]) {
    // Single implementation of the promotion-matching logic
    // Currently copy-pasted 3 times in the resolver
  }
}
```

---

## 5. MARKETPLACE PAGE REFACTORING

### 5.1 Split Into Sections

The current 800-line `marketplace/page.tsx` should be refactored into:

```
marketplace/
├── page.tsx                           # Main container (routing + state)
├── _components/
│   ├── MarketplaceHome.tsx            # NEW: Rich homepage (no filters)
│   ├── MarketplaceFiltered.tsx        # NEW: Filtered results view
│   ├── HorizontalCategoryScroll.tsx   # NEW: Category pills
│   ├── FeaturedProductsCarousel.tsx   # NEW: Featured carousel
│   ├── BusinessTypeShowcase.tsx       # NEW: Type-specific section
│   ├── FeaturedStoresSection.tsx      # NEW: Top stores
│   ├── ProductCardSkeleton.tsx        # NEW: Loading skeleton
│   ├── EnhancedPagination.tsx         # NEW: Better pagination
│   ├── ProductCard.tsx                # KEEP: Enhance with type colors
│   ├── ProductDetailsModal.tsx        # KEEP: Add type-specific fields
│   ├── ServiceCard.tsx                # KEEP
│   ├── BusinessTypeIcons.tsx          # KEEP → refactor to use config
│   ├── BusinessType.tsx               # KEEP → fix typos
│   └── SearchModal.tsx                # KEEP: Enhance
```

### 5.2 Simplified Page Component

```typescript
// marketplace/page.tsx — REFACTORED

export default function MarketplacePage() {
  const [filters, setFilters] = useState(defaultFilters);
  const hasActiveFilters = computeHasActiveFilters(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Always show: Sticky search + filter bar */}
      <MarketplaceToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Conditional rendering based on filter state */}
      {hasActiveFilters ? (
        <MarketplaceFiltered filters={filters} page={page} />
      ) : (
        <MarketplaceHome />
      )}
    </div>
  );
}
```

---

## 6. UI IMPROVEMENTS

### 6.1 Search Experience
| Current | Improved |
|---------|----------|
| Search input in toolbar | Keep — but add typeahead suggestions |
| SearchModal exists | Enhance with recent searches, popular searches, category suggestions |
| No search results preview | Add instant results dropdown (3 products + 2 businesses) |

### 6.2 Loading States
| Current | Improved |
|---------|----------|
| Full-page `<Loader />` spinner | Skeleton cards in grid layout (ProductCardSkeleton) |
| No partial loading | Progressive loading: skeleton → data fills in |
| No shimmer effect | Tailwind `animate-pulse` on skeleton elements |

### 6.3 Empty States
| Current | Improved |
|---------|----------|
| Generic "No products found" | Type-specific empty states with illustrations |
| Single CTA "Clear Filters" | Multiple CTAs: "Clear Filters", "Browse All", "Try Electronics" |

### 6.4 Visual Hierarchy
| Area | Current | Improved |
|------|---------|----------|
| Section headers | None (flat grid) | Type icon + bold title + description + "View All →" |
| Card borders | Orange border on all | Type-specific accent colors |
| Spacing | Consistent gap-6 | Larger gaps between sections (gap-8 to gap-12) |
| Typography | text-3xl for page title | Larger hero area with subtitle |
| Section dividers | None | Subtle gradient dividers between showcase sections |

### 6.5 Responsive Behavior
| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column cards, 2-col showcase grids, horizontal scroll categories |
| Tablet (640-1024px) | 2-column cards, 3-col showcases, collapsible filters |
| Desktop (1024-1280px) | 3-column cards, 4-col showcases, sidebar filters option |
| Large (1280px+) | 4-column cards, full showcases, spacious layout |

---

## 7. HARDCODED DATA TO REPLACE

The marketplace page has **hardcoded** arrays that should come from the centralized config or GraphQL:

| Hardcoded Data | Location | Replace With |
|----------------|----------|-------------|
| `businessTypes` array (lines 136-194) | marketplace/page.tsx | Import from `config/business-types.ts` |
| `productCategories` fallback (lines 195-231) | marketplace/page.tsx | GraphQL query only (remove fallback) |
| Service categories ("DESIGN", "DEV", etc.) | marketplace/page.tsx:382-391 | GraphQL `freelanceServiceCategories` query |
| Business type icons switch/case | BusinessTypeIcons.tsx | Use centralized config |
| Business type labels switch/case | BusinessType.tsx | Use centralized config |
| Business type emojis switch/case | ProductDetailsModal.tsx:62-90 | Use centralized config |
| Receipt HTML business type icons | sale.service.ts:1294-1319 | Use centralized config |

---

## 8. IMPLEMENTATION FILE CHANGES

### New Files (7)
| File | Purpose |
|------|---------|
| `marketplace/_components/MarketplaceHome.tsx` | Rich homepage with showcases |
| `marketplace/_components/MarketplaceFiltered.tsx` | Filtered results view |
| `marketplace/_components/HorizontalCategoryScroll.tsx` | Category pills |
| `marketplace/_components/FeaturedProductsCarousel.tsx` | Featured carousel |
| `marketplace/_components/FeaturedStoresSection.tsx` | Top stores section |
| `marketplace/_components/ProductCardSkeleton.tsx` | Loading skeleton |
| `marketplace/_components/EnhancedPagination.tsx` | Better pagination |

### Modified Files (8)
| File | Changes |
|------|---------|
| `marketplace/page.tsx` | Refactor into container with Home/Filtered views |
| `marketplace/_components/ProductCard.tsx` | Accept type color props from config |
| `marketplace/_components/ProductDetailsModal.tsx` | Show type-specific fields, remove hardcoded emoji switch |
| `marketplace/_components/BusinessTypeIcons.tsx` | Import from centralized config |
| `marketplace/_components/BusinessType.tsx` | Import from config, fix typos |
| `graphql/marketplace.gql.ts` | Add featuredStores, trendingProducts queries |
| `back-api/src/marketplace/marketplace.service.ts` | Move logic from resolver, add new methods |
| `back-api/src/marketplace/marketplace.resolver.ts` | Delegate to service, add new queries |

---

## 9. PRIORITY ORDER

### Sprint 1: Refactoring (No Visual Changes)
1. Create `config/business-types.ts` (Phase 4 dependency)
2. Replace all hardcoded business type arrays with config imports
3. Fix typos ("Grossery", "Accessoires")
4. Move marketplace resolver logic to service
5. Extract `attachPromotions()` helper

### Sprint 2: Rich Homepage
6. Create `MarketplaceHome` component
7. Create `HorizontalCategoryScroll`
8. Create `BusinessTypeShowcase` (reuse from Phase 4)
9. Create `FeaturedProductsCarousel`
10. Refactor `marketplace/page.tsx` to show Home vs Filtered

### Sprint 3: New Sections + Backend
11. Add `featuredStores` query + `FeaturedStoresSection`
12. Add `trendingProducts` query (aggregate from SaleProduct)
13. Create `ProductCardSkeleton` + replace Loader
14. Create `EnhancedPagination`

### Sprint 4: Polish
15. Type-specific card accents (from Phase 4 config)
16. Improved search with typeahead
17. Better empty states per type
18. Responsive fine-tuning
19. Animation/transition polish (framer-motion already installed)

---

# PHASE 6 — NAVIGATION IMPROVEMENT PLAN

---

## 1. CURRENT NAVIGATION STATE

### Main Navbar (`main-navbar.tsx`)
| Issue | Details |
|-------|---------|
| **French labels** | "Accueil", "Produits", "Publicités", "À propos" — should be English |
| **Dead links** | `/products`, `/freelance`, `/ads`, `/about` — these routes don't exist |
| **Three.js Canvas** | Renders a `<Canvas>` with `<Stars>` in the NAVBAR — extremely heavy, unnecessary |
| **No auth-aware nav** | Doesn't show user profile, dashboard link, or role-based menu |
| **Hardcoded blue hover** | `hover:text-blue-600` — should be USCOR orange |
| **No cart indicator** | Cart component commented out |
| **No mobile drawer** | Uses DropdownMenu for mobile — should be Sheet/Drawer |

### HeaderComponent (`seraui/HeaderComponent.tsx`)
| Aspect | Details |
|--------|---------|
| Used on landing page | Auth-aware (shows Login/Dashboard based on session) |
| Has search | Navigates to marketplace with query params |
| Has business type dropdown | With icons and descriptions |
| Has cart | Cart sidebar with item count badge |
| Better than main-navbar | This should be the PRIMARY navigation |

### Worker Navigation
| Component | Status |
|-----------|--------|
| `WorkerLayout.tsx` | Sidebar with sections: POS, Inventory, Shifts, Chats, Reports, Profile |
| Store switcher | Select dropdown in worker page |
| Responsive | Unknown — needs testing |

### Business Navigation
| Component | Status |
|-----------|--------|
| Business layout | Tab-based: Dashboard, Products, Sales, Inventory, Stores, Loyalty, Settings |
| Store/business switcher | Partial |
| Mobile | Unknown |

---

## 2. NAVIGATION REDESIGN

### 2.1 Unified Navigation System

Replace `main-navbar.tsx` with the superior `HeaderComponent` pattern, enhanced:

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] Uscor    [🔍 Search...]    [🛒 3] [👤] [🌙]    │
│                                                          │
│  [Marketplace ▾] [Businesses] [Hardware] [Freelance]     │
│                                                          │
│  Marketplace dropdown:                                    │
│  ┌──────────────────────────────────────┐                │
│  │ 🔌 Electronics    📚 Bookstore      │                │
│  │ 🔨 Hardware       ☕ Cafe           │                │
│  │ 🛒 Grocery        🍽️ Restaurant    │                │
│  │ 🎨 Artisan        🏬 Retail        │                │
│  │ 👕 Clothing       🍷 Bar           │                │
│  └──────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Mobile Navigation

```
┌────────────────────────────┐
│  [☰]  Uscor  [🔍] [🛒] [👤]│
└────────────────────────────┘

Sheet (slide from left):
┌──────────────────────┐
│  👤 Ezechiel          │
│  worker@email.com     │
│  ────────────────     │
│  🏠 Home              │
│  🛒 Marketplace       │
│  🏪 Businesses        │
│  🔨 Hardware          │
│  💼 Freelance         │
│  ────────────────     │
│  📊 Dashboard         │  ← Role-based
│  ⚙️ Settings          │
│  🚪 Sign Out          │
│  ────────────────     │
│  🌙 Dark Mode  [⬤]   │
└──────────────────────┘
```

### 2.3 Role-Based Dashboard Navigation

When user is authenticated, show role-appropriate quick links:

| Role | Dashboard Link | Quick Actions |
|------|---------------|---------------|
| Client | `/client` | My Orders, Wallet, Favorites |
| Worker | `/worker` | POS, Current Shift, Inventory |
| Business | `/business/dashboard` | Dashboard, Products, Sales, Stores |
| Admin | `/admin` | Users, KYC Queue, Announcements |

### 2.4 Command Search (Future)

```
[⌘K] or [Ctrl+K] → Command palette

┌─────────────────────────────────────┐
│  🔍 Search products, stores, pages...│
│  ──────────────────────────────────  │
│  📄 Pages                            │
│  → Marketplace                       │
│  → My Orders                         │
│  → Dashboard                         │
│  ──────────────────────────────────  │
│  🛒 Products                         │
│  → Samsung Galaxy A54                │
│  → iPhone 15 Pro                     │
│  ──────────────────────────────────  │
│  🏪 Businesses                       │
│  → Think Big Corporation             │
└─────────────────────────────────────┘
```

---

## 3. IMPLEMENTATION FILES

### Navigation Changes
| File | Action | Changes |
|------|--------|---------|
| `components/main-navbar.tsx` | DEPRECATE | Remove Three.js Canvas, French labels |
| `components/seraui/HeaderComponent.tsx` | ENHANCE | Make this the primary navbar, add mobile drawer |
| `components/MobileNavDrawer.tsx` | CREATE | Sheet-based mobile nav with role awareness |
| `components/CommandSearch.tsx` | CREATE (Future) | ⌘K command palette |
| `app/layout.tsx` or route layouts | MODIFY | Use HeaderComponent everywhere, not just landing |

### Key Fixes
1. Remove `<Canvas><Stars>` from navbar — adds ~200KB JS for decoration in a nav
2. Fix nav links: remove `/products`, `/ads`, `/about` → replace with `/marketplace`, `/all-businesses`, `/hardware`
3. Change French labels to English
4. Change `hover:text-blue-600` to `hover:text-orange-500` (USCOR brand)
5. Enable cart component (currently commented out)
6. Add user avatar + dropdown with role-based links

---

## 4. COMBINED IMPLEMENTATION ROADMAP (Phases 5+6)

### Sprint 1: Navigation Fix + Config
1. Create `config/business-types.ts`
2. Deprecate `main-navbar.tsx`, enhance `HeaderComponent` as primary
3. Fix French labels, dead links, blue hover colors
4. Remove Three.js Canvas from navbar
5. Create mobile nav drawer (Sheet)
6. Enable cart in navigation

### Sprint 2: Marketplace Refactor
7. Move marketplace resolver logic to service
8. Extract `attachPromotions()` helper
9. Replace hardcoded arrays with config imports
10. Split marketplace page into Home/Filtered views

### Sprint 3: Rich Marketplace
11. HorizontalCategoryScroll
12. FeaturedProductsCarousel
13. BusinessTypeShowcase sections
14. FeaturedStoresSection
15. ProductCardSkeleton

### Sprint 4: Polish
16. EnhancedPagination
17. Type-specific card accents
18. Improved search UX
19. Empty states per type
20. Responsive fine-tuning
21. Animation polish

---

*Plans completed: Phase 5 — Marketplace Redesign + Phase 6 — Navigation Improvement*
*Next: Phase 7-11 (Worker, Customer, Business, Reporting, Frontend Modernization)*
*Source of truth: Final Year Thesis by Kambale Kiregha Ezechiel, June 2026*
