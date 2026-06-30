# PHASE 4 — BUSINESS TYPE EXPERIENCES PLAN
## Context-Aware Commerce for East African SMEs

---

## 1. CURRENT STATE ASSESSMENT

### What Exists (Implemented)
| Component | Status | Quality |
|-----------|--------|---------|
| `BusinessType` enum in schema | PARTIAL — stored as `String` not enum | Should be Prisma enum |
| `BusinessTypeIcon` component | COMPLETE | 10 types with Lucide icons |
| `GetBusinessType()` display names | COMPLETE | Has typos: "Grossery", "Accessoires" |
| `CATEGORIES_BY_BUSINESS_TYPE` in ProductForm | COMPLETE | All 10 types have category definitions |
| Product `variants` JSON field | EXISTS | Generic, not business-type-aware |
| Business type filter in marketplace | COMPLETE | Filters products by business.businessType |
| Receipt HTML business type icons | COMPLETE | Emoji-based per type |
| Hardware page `/hardware` | EXISTS | Static showcase of POS peripherals |
| StatusBadge component | COMPLETE | 4 variants: pro, beta, next, default |
| Business type in product cards | COMPLETE | Icon + name shown |
| Business type in business cards | COMPLETE | Icon + type badge |

### What's Missing Per Business Type

#### ELECTRONICS (Flagship — HIGHEST PRIORITY)
| Feature | Thesis Requirement | Status |
|---------|-------------------|--------|
| Serial number tracking | YES | NO field on Product |
| IMEI tracking | YES | NO field on Product |
| Warranty period | YES | NO field on Product |
| Warranty certificates | YES | NO model/UI |
| Compatibility info | YES | NO |
| Accessories/Bundles | YES | NO relation |
| Repair tracking | YES | NO model |
| Supplier management | YES | PurchaseOrder exists, no supplier entity |
| Electronics showcase page | YES | NO |
| Electronics-specific card design | YES | NO — generic ProductCard |
| Brand/model fields | YES | NO |

#### HARDWARE (Flagship — HIGH PRIORITY)
| Feature | Thesis Requirement | Status |
|---------|-------------------|--------|
| Industrial categories | YES | Basic in ProductForm |
| Bulk pricing | YES | NO |
| MOQ (Minimum Order Quantity) | YES | NO field |
| Wholesale tiers | YES | NO |
| Supplier management | YES | PurchaseOrder exists |
| Transfer orders | YES | Backend exists, no UI |
| Hardware showcase page | PARTIAL | Static page exists |
| Weight/dimensions | YES | NO fields |

#### BOOKSTORE
| Feature | Thesis Requirement | Status |
|---------|-------------------|--------|
| ISBN | YES | NO field |
| Author | YES | NO field |
| Academic sections | YES | Category "Academic" exists |
| Stationery | YES | Category "Stationery" exists |
| Publisher | YES | NO field |

#### CAFE
| Feature | Thesis Requirement | Status |
|---------|-------------------|--------|
| Menu system | YES | Uses product categories |
| Modifiers (no sugar, extra shot) | YES | SaleProduct.modifiers JSON exists |
| Order preparation status | YES | NO |
| Table management | YES | NO |
| Kitchen display | YES | NO |

#### RESTAURANT
| Feature | Thesis Requirement | Status |
|---------|-------------------|--------|
| Reservations | YES | NO model |
| Table management | YES | NO |
| Order routing | YES | NO |
| Kitchen display | YES | NO |
| Waiter assignment | YES | NO |

#### ARTISAN
| Feature | Thesis Requirement | Status |
|---------|-------------------|--------|
| Custom order workflow | YES | FreelanceOrder exists |
| Portfolio showcase | YES | NO |
| Commission tracking | YES | TokenTransaction exists |
| Material cost | YES | NO |

---

## 2. BUSINESS TYPE CONFIGURATION SYSTEM

### 2.1 Centralized Type Registry

Create a single source of truth for all business type metadata:

```typescript
// config/business-types.ts

export interface BusinessTypeConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  color: {
    primary: string;      // Main accent color
    bg: string;           // Card background tint
    border: string;       // Card border color
    badge: string;        // Badge styling
  };
  productFields: ProductFieldConfig[];  // Type-specific product fields
  categories: CategoryConfig[];
  cardStyle: 'standard' | 'compact' | 'detailed' | 'showcase';
  dashboardWidgets: string[];
  posModifiers: boolean;        // Whether POS shows modifiers
  features: {
    serialTracking: boolean;
    warrantyTracking: boolean;
    expiryTracking: boolean;
    modifiers: boolean;
    bulkPricing: boolean;
    tableManagement: boolean;
    reservations: boolean;
    isbn: boolean;
  };
  statusBadges: StatusBadgeConfig[];  // For planned/coming features
}

interface ProductFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  placeholder?: string;
  options?: string[];   // For select type
  visibleIn: ('form' | 'card' | 'detail' | 'pos')[];
}
```

### 2.2 Type Configurations

```typescript
export const BUSINESS_TYPES: Record<string, BusinessTypeConfig> = {
  ELECTRONICS: {
    key: 'ELECTRONICS',
    label: 'Electronics & Gadgets',
    description: 'Smartphones, laptops, accessories, and gadgets',
    icon: Plug,
    emoji: '🔌',
    color: {
      primary: 'blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    productFields: [
      { key: 'brand', label: 'Brand', type: 'text', required: true, 
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'model', label: 'Model', type: 'text', required: false, 
        visibleIn: ['form', 'detail'] },
      { key: 'serialNumber', label: 'Serial Number', type: 'text', required: false, 
        visibleIn: ['form', 'detail', 'pos'] },
      { key: 'imei', label: 'IMEI', type: 'text', required: false, 
        visibleIn: ['form', 'detail'] },
      { key: 'warrantyMonths', label: 'Warranty (months)', type: 'number', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'condition', label: 'Condition', type: 'select', required: true,
        options: ['New', 'Refurbished', 'Used'], visibleIn: ['form', 'card', 'detail'] },
      { key: 'color', label: 'Color', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'storage', label: 'Storage', type: 'text', required: false,
        placeholder: 'e.g., 128GB', visibleIn: ['form', 'card', 'detail'] },
      { key: 'ram', label: 'RAM', type: 'text', required: false,
        placeholder: 'e.g., 8GB', visibleIn: ['form', 'detail'] },
    ],
    features: {
      serialTracking: true,
      warrantyTracking: true,
      expiryTracking: false,
      modifiers: false,
      bulkPricing: false,
      tableManagement: false,
      reservations: false,
      isbn: false,
    },
    cardStyle: 'detailed',
    posModifiers: false,
    dashboardWidgets: ['warranty-expiring', 'top-brands', 'serial-lookup'],
    statusBadges: [
      { text: 'Repair Tracking', variant: 'next' },
      { text: 'Compatibility Check', variant: 'next' },
    ],
    categories: [/* ... existing ELECTRONICS categories ... */],
  },

  HARDWARE: {
    key: 'HARDWARE',
    label: 'Hardware & Tools',
    description: 'Construction materials, tools, and industrial supplies',
    icon: Hammer,
    emoji: '🔨',
    color: {
      primary: 'orange-700',
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-orange-200 dark:border-orange-800',
      badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    },
    productFields: [
      { key: 'brand', label: 'Brand', type: 'text', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'material', label: 'Material', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'weight', label: 'Weight (kg)', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'dimensions', label: 'Dimensions', type: 'text', required: false,
        placeholder: 'L x W x H cm', visibleIn: ['form', 'detail'] },
      { key: 'moq', label: 'Min Order Qty', type: 'number', required: false,
        visibleIn: ['form', 'card'] },
      { key: 'bulkPrice', label: 'Bulk Price (10+)', type: 'number', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'warrantyMonths', label: 'Warranty (months)', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: true,
      expiryTracking: false,
      modifiers: false,
      bulkPricing: true,
      tableManagement: false,
      reservations: false,
      isbn: false,
    },
    cardStyle: 'standard',
    posModifiers: false,
    dashboardWidgets: ['bulk-orders', 'supplier-performance', 'low-stock-industrial'],
    statusBadges: [
      { text: 'Wholesale Portal', variant: 'next' },
      { text: 'Supplier Network', variant: 'beta' },
    ],
    categories: [/* ... existing HARDWARE categories ... */],
  },

  BOOKSTORE: {
    key: 'BOOKSTORE',
    label: 'Bookstore & Stationery',
    description: 'Books, educational materials, and stationery supplies',
    icon: BookOpen,
    emoji: '📚',
    color: {
      primary: 'emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    productFields: [
      { key: 'isbn', label: 'ISBN', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'author', label: 'Author', type: 'text', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'publisher', label: 'Publisher', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'edition', label: 'Edition', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'language', label: 'Language', type: 'select', required: false,
        options: ['English', 'French', 'Kinyarwanda', 'Swahili'], 
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'pages', label: 'Pages', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: false,
      modifiers: false, bulkPricing: true, tableManagement: false,
      reservations: false, isbn: true,
    },
    cardStyle: 'compact',
    posModifiers: false,
    dashboardWidgets: ['academic-calendar', 'top-authors', 'stationery-stock'],
    statusBadges: [
      { text: 'Academic Calendar', variant: 'next' },
      { text: 'Pre-orders', variant: 'next' },
    ],
    categories: [/* ... existing BOOKSTORE categories ... */],
  },

  CAFE: {
    key: 'CAFE',
    label: 'Cafe & Coffee Shops',
    description: 'Coffee, tea, pastries, and light meals',
    icon: Coffee,
    emoji: '☕',
    color: {
      primary: 'amber-700',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    productFields: [
      { key: 'size', label: 'Size Options', type: 'text', required: false,
        placeholder: 'S, M, L', visibleIn: ['form', 'pos'] },
      { key: 'temperature', label: 'Temp Options', type: 'text', required: false,
        placeholder: 'Hot, Iced', visibleIn: ['form', 'pos'] },
      { key: 'calories', label: 'Calories', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'allergens', label: 'Allergens', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: true,
      modifiers: true, bulkPricing: false, tableManagement: false,
      reservations: false, isbn: false,
    },
    cardStyle: 'compact',
    posModifiers: true,
    dashboardWidgets: ['today-menu', 'popular-items', 'peak-hours'],
    statusBadges: [
      { text: 'Table Orders', variant: 'next' },
      { text: 'Kitchen Display', variant: 'next' },
    ],
    categories: [/* ... existing CAFE categories ... */],
  },

  RESTAURANT: {
    key: 'RESTAURANT',
    label: 'Restaurant & Dining',
    description: 'Full-service dining with table management',
    icon: UtensilsCrossed,
    emoji: '🍽️',
    color: {
      primary: 'red-600',
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
    productFields: [
      { key: 'prepTime', label: 'Prep Time (min)', type: 'number', required: false,
        visibleIn: ['form', 'detail', 'pos'] },
      { key: 'spiceLevel', label: 'Spice Level', type: 'select', required: false,
        options: ['Mild', 'Medium', 'Hot', 'Extra Hot'], visibleIn: ['form', 'card', 'pos'] },
      { key: 'calories', label: 'Calories', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'allergens', label: 'Allergens', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'servingSize', label: 'Serves', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: true,
      modifiers: true, bulkPricing: false, tableManagement: true,
      reservations: true, isbn: false,
    },
    cardStyle: 'compact',
    posModifiers: true,
    dashboardWidgets: ['table-status', 'kitchen-queue', 'reservations-today'],
    statusBadges: [
      { text: 'Reservations', variant: 'next' },
      { text: 'Table Map', variant: 'next' },
      { text: 'Kitchen Display', variant: 'next' },
    ],
    categories: [/* ... existing RESTAURANT categories ... */],
  },

  GROCERY: {
    key: 'GROCERY',
    label: 'Grocery & Convenience',
    description: 'Fresh produce, dairy, beverages, and household items',
    icon: ShoppingCart,
    emoji: '🛒',
    color: {
      primary: 'green-600',
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    },
    productFields: [
      { key: 'weight', label: 'Weight/Volume', type: 'text', required: false,
        placeholder: 'e.g., 500g, 1L', visibleIn: ['form', 'card', 'detail'] },
      { key: 'expiryDate', label: 'Expiry Date', type: 'date', required: false,
        visibleIn: ['form', 'detail', 'pos'] },
      { key: 'origin', label: 'Origin', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'organic', label: 'Organic', type: 'boolean', required: false,
        visibleIn: ['form', 'card', 'detail'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: true,
      modifiers: false, bulkPricing: true, tableManagement: false,
      reservations: false, isbn: false,
    },
    cardStyle: 'standard',
    posModifiers: false,
    dashboardWidgets: ['expiring-soon', 'restock-alerts', 'daily-specials'],
    statusBadges: [],
    categories: [/* ... existing GROCERY categories ... */],
  },

  ARTISAN: {
    key: 'ARTISAN',
    label: 'Artisan & Handcrafted Goods',
    description: 'Handmade crafts, art, jewelry, and custom creations',
    icon: Palette,
    emoji: '🎨',
    color: {
      primary: 'rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    },
    productFields: [
      { key: 'material', label: 'Material', type: 'text', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'technique', label: 'Technique', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'customizable', label: 'Customizable', type: 'boolean', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'productionTime', label: 'Production Time (days)', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'artist', label: 'Artist', type: 'text', required: false,
        visibleIn: ['form', 'card', 'detail'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: false,
      modifiers: false, bulkPricing: false, tableManagement: false,
      reservations: false, isbn: false,
    },
    cardStyle: 'showcase',
    posModifiers: false,
    dashboardWidgets: ['custom-orders', 'portfolio', 'commission-tracker'],
    statusBadges: [
      { text: 'Custom Orders', variant: 'beta' },
      { text: 'Portfolio', variant: 'next' },
    ],
    categories: [/* ... existing ARTISAN categories ... */],
  },

  RETAIL: {
    key: 'RETAIL',
    label: 'Retail & General Stores',
    description: 'General merchandise and multi-category retail',
    icon: Store,
    emoji: '🏬',
    color: {
      primary: 'slate-600',
      bg: 'bg-slate-50 dark:bg-slate-950/20',
      border: 'border-slate-200 dark:border-slate-800',
      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    productFields: [
      { key: 'brand', label: 'Brand', type: 'text', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'sku', label: 'SKU', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'barcode', label: 'Barcode', type: 'text', required: false,
        visibleIn: ['form'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: false,
      modifiers: false, bulkPricing: false, tableManagement: false,
      reservations: false, isbn: false,
    },
    cardStyle: 'standard',
    posModifiers: false,
    dashboardWidgets: ['category-performance', 'seasonal-trends'],
    statusBadges: [],
    categories: [/* ... existing RETAIL categories ... */],
  },

  BAR: {
    key: 'BAR',
    label: 'Bar & Pub',
    description: 'Beverages, spirits, and bar snacks',
    icon: Wine,
    emoji: '🍷',
    color: {
      primary: 'purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-purple-200 dark:border-purple-800',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    productFields: [
      { key: 'volume', label: 'Volume', type: 'text', required: false,
        placeholder: 'e.g., 330ml, 750ml', visibleIn: ['form', 'card', 'detail'] },
      { key: 'alcoholContent', label: 'ABV %', type: 'number', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'origin', label: 'Origin', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'servingTemp', label: 'Serving Temp', type: 'select', required: false,
        options: ['Chilled', 'Room Temp', 'Warm'], visibleIn: ['form', 'pos'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: true,
      modifiers: true, bulkPricing: false, tableManagement: true,
      reservations: false, isbn: false,
    },
    cardStyle: 'compact',
    posModifiers: true,
    dashboardWidgets: ['happy-hour', 'popular-drinks', 'tab-tracking'],
    statusBadges: [
      { text: 'Tab System', variant: 'next' },
    ],
    categories: [/* ... existing BAR categories ... */],
  },

  CLOTHING: {
    key: 'CLOTHING',
    label: 'Clothing & Accessories',
    description: 'Fashion, apparel, footwear, and accessories',
    icon: Shirt,
    emoji: '👕',
    color: {
      primary: 'pink-600',
      bg: 'bg-pink-50 dark:bg-pink-950/20',
      border: 'border-pink-200 dark:border-pink-800',
      badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    },
    productFields: [
      { key: 'size', label: 'Size', type: 'select', required: true,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], visibleIn: ['form', 'card', 'detail', 'pos'] },
      { key: 'color', label: 'Color', type: 'text', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'material', label: 'Material', type: 'text', required: false,
        visibleIn: ['form', 'detail'] },
      { key: 'brand', label: 'Brand', type: 'text', required: false,
        visibleIn: ['form', 'card', 'detail'] },
      { key: 'gender', label: 'Gender', type: 'select', required: false,
        options: ['Men', 'Women', 'Unisex', 'Kids'], visibleIn: ['form', 'card'] },
    ],
    features: {
      serialTracking: false, warrantyTracking: false, expiryTracking: false,
      modifiers: false, bulkPricing: false, tableManagement: false,
      reservations: false, isbn: false,
    },
    cardStyle: 'standard',
    posModifiers: false,
    dashboardWidgets: ['size-distribution', 'trending-styles'],
    statusBadges: [],
    categories: [/* ... existing CLOTHING categories ... */],
  },
};
```

---

## 3. PRODUCT CARD SPECIALIZATION

### 3.1 Typed Product Card Component

The current `ProductCard.tsx` renders identically for all business types. The plan is to create a wrapper that delegates to type-specific card renderers:

```typescript
// components/marketplace/TypedProductCard.tsx

export default function TypedProductCard({ product, viewMode }) {
  const config = BUSINESS_TYPES[product.business.businessType];
  if (!config) return <ProductCard product={product} viewMode={viewMode} />;

  const borderColor = config.color.border;
  const bgTint = config.color.bg;

  return (
    <div className={cn('rounded-lg overflow-hidden', borderColor, bgTint)}>
      {/* Type-specific header accent */}
      <div className={cn('h-1', `bg-${config.color.primary}`)} />

      {/* Standard card content with type-specific extras */}
      <ProductCard product={product} viewMode={viewMode} />

      {/* Type-specific fields rendered from config */}
      <TypeSpecificFields
        fields={config.productFields.filter(f => f.visibleIn.includes('card'))}
        data={product.variants || {}}
        businessType={product.business.businessType}
      />

      {/* Feature badges for unimplemented features */}
      {config.statusBadges.map(badge => (
        <StatusBadge key={badge.text} text={badge.text} variant={badge.variant} />
      ))}
    </div>
  );
}
```

### 3.2 Card Visual Differences Per Type

| Type | Card Accent | Special Display | Card Feel |
|------|-------------|----------------|-----------|
| ELECTRONICS | Blue top bar | Brand + Storage + Warranty badge | Technical, precise |
| HARDWARE | Orange top bar | Weight + MOQ + Bulk price | Industrial, sturdy |
| BOOKSTORE | Emerald top bar | Author + ISBN | Educational, clean |
| CAFE | Amber top bar | Size options + Modifiers | Warm, inviting |
| RESTAURANT | Red top bar | Prep time + Spice indicator | Rich, appetizing |
| GROCERY | Green top bar | Weight + Expiry countdown | Fresh, organic |
| ARTISAN | Rose top bar | Material + Artist + "Customizable" badge | Creative, unique |
| RETAIL | Slate top bar | Brand + SKU | Neutral, professional |
| BAR | Purple top bar | Volume + ABV% | Dark, sophisticated |
| CLOTHING | Pink top bar | Size + Color swatches + Gender | Fashionable, visual |

---

## 4. PRODUCT FORM ENHANCEMENT

### 4.1 Dynamic Fields Based on Business Type

The existing `ProductForm.tsx` already has `CATEGORIES_BY_BUSINESS_TYPE` — extend it to render type-specific fields:

```typescript
// In ProductForm, after basic fields:

{config.productFields.map(field => (
  <div key={field.key}>
    <Label>{field.label} {field.required && '*'}</Label>
    {field.type === 'text' && (
      <Input
        value={typeModifiers[field.key] || ''}
        onChange={e => setTypeModifiers({...typeModifiers, [field.key]: e.target.value})}
        placeholder={field.placeholder}
      />
    )}
    {field.type === 'number' && (
      <Input type="number" ... />
    )}
    {field.type === 'select' && (
      <Select value={typeModifiers[field.key]} onValueChange={...}>
        {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
      </Select>
    )}
    {field.type === 'boolean' && (
      <Switch checked={typeModifiers[field.key]} onCheckedChange={...} />
    )}
    {field.type === 'date' && (
      <Input type="date" ... />
    )}
  </div>
))}
```

**Storage:** These fields go into `Product.variants` JSON field (already exists in Prisma), with the key structure:

```json
{
  "brand": "Samsung",
  "model": "Galaxy A54",
  "serialNumber": "SN12345",
  "warrantyMonths": 12,
  "condition": "New",
  "storage": "128GB",
  "ram": "6GB"
}
```

---

## 5. MARKETPLACE SHOWCASE SECTIONS

### 5.1 Business-Type Showcase Component

```typescript
// components/marketplace/BusinessTypeShowcase.tsx

export function BusinessTypeShowcase({ businessType, products }) {
  const config = BUSINESS_TYPES[businessType];
  if (!config || products.length === 0) return null;

  return (
    <section className={cn('rounded-xl p-6 mb-8', config.color.bg, config.color.border, 'border')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.color.badge)}>
            <config.icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{config.label}</h2>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/marketplace?businessType=${businessType}`}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map(product => (
          <TypedProductCard key={product.id} product={product} viewMode="grid" />
        ))}
      </div>
    </section>
  );
}
```

### 5.2 Enhanced Marketplace Home Layout

```
┌──────────────────────────────────────────────┐
│  Search Bar + Category Filters                │
├──────────────────────────────────────────────┤
│  🔌 Electronics & Gadgets Showcase           │
│  [Samsung A54] [iPhone 15] [Laptop] [AirPods]│
│                                    View All →│
├──────────────────────────────────────────────┤
│  🔨 Hardware & Tools Showcase                │
│  [Power Drill] [Cement] [PVC Pipes] [Nails]  │
│                                    View All →│
├──────────────────────────────────────────────┤
│  📚 Bookstore & Stationery                   │
│  [Textbook] [Novel] [Pens Set] [Notebook]    │
│                                    View All →│
├──────────────────────────────────────────────┤
│  ☕ Cafe & Coffee Shops                      │
│  [Cappuccino] [Croissant] [Latte] [Muffin]   │
│                                    View All →│
├──────────────────────────────────────────────┤
│  🛒 All Products (Paginated Grid)            │
└──────────────────────────────────────────────┘
```

---

## 6. DASHBOARD SPECIALIZATION

### 6.1 Business Dashboard Widgets by Type

The business dashboard should show different widgets based on `businessType`:

| Widget | Types | Data Source |
|--------|-------|-------------|
| Warranty Expiring Soon | ELECTRONICS, HARDWARE | Product.variants.warrantyMonths + Sale.createdAt |
| Top Brands | ELECTRONICS, CLOTHING | Product.variants.brand aggregation |
| Serial Number Lookup | ELECTRONICS | Product.variants.serialNumber |
| Expiring Products | GROCERY, CAFE, RESTAURANT, BAR | Product.variants.expiryDate |
| Popular Menu Items | CAFE, RESTAURANT | SaleProduct aggregation |
| Bulk Order Summary | HARDWARE, GROCERY | Orders with qty > MOQ |
| Academic Calendar | BOOKSTORE | Static calendar widget |
| Custom Orders | ARTISAN | FreelanceOrder count |
| Size Distribution | CLOTHING | Product.variants.size aggregation |

---

## 7. IMPLEMENTATION FILE CHANGES

### New Files to Create
| File | Purpose |
|------|---------|
| `config/business-types.ts` | Centralized type registry with all metadata |
| `components/marketplace/TypedProductCard.tsx` | Type-aware product card wrapper |
| `components/marketplace/TypeSpecificFields.tsx` | Renders dynamic fields from config |
| `components/marketplace/BusinessTypeShowcase.tsx` | Type section for marketplace home |
| `components/dashboard/TypeSpecificWidgets.tsx` | Dashboard widgets loader |

### Files to Modify
| File | Changes |
|------|---------|
| `marketplace/_components/ProductCard.tsx` | Accept business type color/style props |
| `marketplace/_components/ProductDetailsModal.tsx` | Render type-specific fields from variants |
| `marketplace/_components/BusinessType.tsx` | Import from centralized config, fix typos |
| `marketplace/_components/BusinessTypeIcons.tsx` | Import from centralized config |
| `business/_components/modals/ProductForm.tsx` | Add dynamic fields from config |
| `marketplace/page.tsx` | Add business type showcase sections |
| `sale/sale.service.ts` receipt HTML | Use config instead of switch/case |
| `components/StatusBadge.tsx` | Add "planned" and "coming-soon" variants |

### Backend Changes
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Convert `businessType String` to proper enum |
| `product/dto/create-product.input.ts` | Add `typeModifiers: JSON` field (or rename variants) |

---

## 8. PRIORITY IMPLEMENTATION ORDER

### Sprint 1: Foundation
1. Create `config/business-types.ts` — single source of truth
2. Fix typos in `BusinessType.tsx` ("Grossery" → "Grocery", "Accessoires" → "Accessories")
3. Refactor `BusinessTypeIcons.tsx` to use config
4. Add "planned"/"coming-soon" StatusBadge variants

### Sprint 2: Electronics Vertical (Flagship)
5. Add electronics product fields to ProductForm
6. Create `TypedProductCard` with electronics-specific display
7. Create electronics showcase section on marketplace
8. Add serial/warranty fields to product detail modal
9. Add warranty widget to electronics business dashboard

### Sprint 3: Hardware Vertical (Flagship)
10. Add hardware product fields to ProductForm
11. Add bulk pricing / MOQ display to cards
12. Enhance hardware page with real data (not static)
13. Add supplier/transfer order links

### Sprint 4: All Other Types
14. Add remaining type fields to ProductForm
15. Create showcase sections for all types on marketplace
16. Add type-specific dashboard widgets
17. Add StatusBadge for unimplemented features per type

---

## 9. TYPOS TO FIX

| File | Current | Correct |
|------|---------|---------|
| `BusinessType.tsx:7` | "Grossery" | "Grocery" |
| `BusinessType.tsx:26` | "Accessoires" | "Accessories" |
| `manifest.ts:8` | `theme_color: '#0070f3'` (blue) | Should be `'#f97316'` (USCOR orange) |

---

*Plan completed: Phase 4 — Business Type Experiences*
*Electronics and Hardware are the flagship verticals — prioritize them.*
*Next: Phase 5 — Marketplace Redesign*
*Source of truth: Final Year Thesis by Kambale Kiregha Ezechiel, June 2026*
