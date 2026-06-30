import {
  BookOpen,
  Coffee,
  Hammer,
  type LucideIcon,
  Palette,
  Plug,
  Shirt,
  ShoppingCart,
  Store,
  UtensilsCrossed,
  Wine,
} from "lucide-react";

// ─── Product Field Configuration ────────────────────────────────────────────

export interface ProductFieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  required: boolean;
  placeholder?: string;
  options?: string[];
  visibleIn: ("form" | "card" | "detail" | "pos")[];
  /** If true, stored in a dedicated Prisma column; otherwise stored in variants JSON */
  dedicated?: boolean;
}

// ─── Business Type Configuration ────────────────────────────────────────────

export interface BusinessTypeConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  color: {
    primary: string;
    bg: string;
    border: string;
    badge: string;
    text: string;
  };
  productFields: ProductFieldConfig[];
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
  cardStyle: "standard" | "compact" | "detailed" | "showcase";
  posModifiers: boolean;
}

// ─── Dedicated Prisma columns (not stored in variants JSON) ─────────────────

const DEDICATED_COLUMNS = new Set([
  "brand",
  "serialNumber",
  "imei",
  "warrantyMonths",
  "sku",
  "barcode",
]);

/** Check if a field key maps to a dedicated Prisma column */
export function isDedicatedField(key: string): boolean {
  return DEDICATED_COLUMNS.has(key);
}

// ─── Type Configurations ────────────────────────────────────────────────────

export const BUSINESS_TYPES: Record<string, BusinessTypeConfig> = {
  ELECTRONICS: {
    key: "ELECTRONICS",
    label: "Electronics & Gadgets",
    description:
      "Electronics retailers, gadget stores, and tech repair services",
    icon: Plug,
    emoji: "🔌",
    color: {
      primary: "blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      text: "text-blue-600 dark:text-blue-400",
    },
    productFields: [
      {
        key: "brand",
        label: "Brand",
        type: "text",
        required: true,
        dedicated: true,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "model",
        label: "Model",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "serialNumber",
        label: "Serial Number",
        type: "text",
        required: false,
        dedicated: true,
        visibleIn: ["form", "detail", "pos"],
      },
      {
        key: "imei",
        label: "IMEI",
        type: "text",
        required: false,
        dedicated: true,
        visibleIn: ["form", "detail"],
      },
      {
        key: "warrantyMonths",
        label: "Warranty (months)",
        type: "number",
        required: false,
        dedicated: true,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "condition",
        label: "Condition",
        type: "select",
        required: true,
        options: ["New", "Refurbished", "Used"],
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "color",
        label: "Color",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "storage",
        label: "Storage",
        type: "text",
        required: false,
        placeholder: "e.g., 128GB",
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "ram",
        label: "RAM",
        type: "text",
        required: false,
        placeholder: "e.g., 8GB",
        visibleIn: ["form", "detail"],
      },
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
    cardStyle: "detailed",
    posModifiers: false,
  },

  HARDWARE: {
    key: "HARDWARE",
    label: "Hardware & Tools",
    description:
      "Hardware stores, tool suppliers, and building material retailers",
    icon: Hammer,
    emoji: "🔨",
    color: {
      primary: "orange-700",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-800",
      badge:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
      text: "text-orange-700 dark:text-orange-400",
    },
    productFields: [
      {
        key: "brand",
        label: "Brand",
        type: "text",
        required: false,
        dedicated: true,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "material",
        label: "Material",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "weight",
        label: "Weight (kg)",
        type: "number",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "dimensions",
        label: "Dimensions",
        type: "text",
        required: false,
        placeholder: "L x W x H cm",
        visibleIn: ["form", "detail"],
      },
      {
        key: "moq",
        label: "Min Order Qty",
        type: "number",
        required: false,
        visibleIn: ["form", "card"],
      },
      {
        key: "bulkPrice",
        label: "Bulk Price (10+)",
        type: "number",
        required: false,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "warrantyMonths",
        label: "Warranty (months)",
        type: "number",
        required: false,
        dedicated: true,
        visibleIn: ["form", "detail"],
      },
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
    cardStyle: "standard",
    posModifiers: false,
  },

  BOOKSTORE: {
    key: "BOOKSTORE",
    label: "Bookstore & Stationery",
    description: "Book sellers, stationery shops, and publishing businesses",
    icon: BookOpen,
    emoji: "📚",
    color: {
      primary: "emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800",
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    productFields: [
      {
        key: "isbn",
        label: "ISBN",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "author",
        label: "Author",
        type: "text",
        required: false,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "publisher",
        label: "Publisher",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "edition",
        label: "Edition",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "language",
        label: "Language",
        type: "select",
        required: false,
        options: ["English", "French", "Kinyarwanda", "Swahili"],
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "pages",
        label: "Pages",
        type: "number",
        required: false,
        visibleIn: ["form", "detail"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: false,
      modifiers: false,
      bulkPricing: true,
      tableManagement: false,
      reservations: false,
      isbn: true,
    },
    cardStyle: "compact",
    posModifiers: false,
  },

  CAFE: {
    key: "CAFE",
    label: "Cafe & Coffee Shops",
    description: "Coffee shops, cafes, and beverage-focused businesses",
    icon: Coffee,
    emoji: "☕",
    color: {
      primary: "amber-700",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-800",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      text: "text-amber-700 dark:text-amber-400",
    },
    productFields: [
      {
        key: "size",
        label: "Size Options",
        type: "text",
        required: false,
        placeholder: "S, M, L",
        visibleIn: ["form", "pos"],
      },
      {
        key: "temperature",
        label: "Temp Options",
        type: "text",
        required: false,
        placeholder: "Hot, Iced",
        visibleIn: ["form", "pos"],
      },
      {
        key: "calories",
        label: "Calories",
        type: "number",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "allergens",
        label: "Allergens",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: true,
      modifiers: true,
      bulkPricing: false,
      tableManagement: false,
      reservations: false,
      isbn: false,
    },
    cardStyle: "compact",
    posModifiers: true,
  },

  RESTAURANT: {
    key: "RESTAURANT",
    label: "Restaurant & Dining",
    description:
      "Full-service restaurants, eateries, and dining establishments",
    icon: UtensilsCrossed,
    emoji: "🍽️",
    color: {
      primary: "red-600",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      text: "text-red-600 dark:text-red-400",
    },
    productFields: [
      {
        key: "prepTime",
        label: "Prep Time (min)",
        type: "number",
        required: false,
        visibleIn: ["form", "detail", "pos"],
      },
      {
        key: "spiceLevel",
        label: "Spice Level",
        type: "select",
        required: false,
        options: ["Mild", "Medium", "Hot", "Extra Hot"],
        visibleIn: ["form", "card", "pos"],
      },
      {
        key: "calories",
        label: "Calories",
        type: "number",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "allergens",
        label: "Allergens",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "servingSize",
        label: "Serves",
        type: "number",
        required: false,
        visibleIn: ["form", "detail"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: true,
      modifiers: true,
      bulkPricing: false,
      tableManagement: true,
      reservations: true,
      isbn: false,
    },
    cardStyle: "compact",
    posModifiers: true,
  },

  GROCERY: {
    key: "GROCERY",
    label: "Grocery & Convenience",
    description: "Grocery stores, supermarkets, and convenience shops",
    icon: ShoppingCart,
    emoji: "🛒",
    color: {
      primary: "green-600",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-800",
      badge:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      text: "text-green-600 dark:text-green-400",
    },
    productFields: [
      {
        key: "weight",
        label: "Weight/Volume",
        type: "text",
        required: false,
        placeholder: "e.g., 500g, 1L",
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "expiryDate",
        label: "Expiry Date",
        type: "date",
        required: false,
        visibleIn: ["form", "detail", "pos"],
      },
      {
        key: "origin",
        label: "Origin",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "organic",
        label: "Organic",
        type: "boolean",
        required: false,
        visibleIn: ["form", "card", "detail"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: true,
      modifiers: false,
      bulkPricing: true,
      tableManagement: false,
      reservations: false,
      isbn: false,
    },
    cardStyle: "standard",
    posModifiers: false,
  },

  ARTISAN: {
    key: "ARTISAN",
    label: "Artisan & Handcrafted Goods",
    description:
      "Craftsmen, wood workers, local artisans creating handmade products",
    icon: Palette,
    emoji: "🎨",
    color: {
      primary: "rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      border: "border-rose-200 dark:border-rose-800",
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      text: "text-rose-600 dark:text-rose-400",
    },
    productFields: [
      {
        key: "material",
        label: "Material",
        type: "text",
        required: false,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "technique",
        label: "Technique",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "customizable",
        label: "Customizable",
        type: "boolean",
        required: false,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "productionTime",
        label: "Production Time (days)",
        type: "number",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "artist",
        label: "Artist",
        type: "text",
        required: false,
        visibleIn: ["form", "card", "detail"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: false,
      modifiers: false,
      bulkPricing: false,
      tableManagement: false,
      reservations: false,
      isbn: false,
    },
    cardStyle: "showcase",
    posModifiers: false,
  },

  RETAIL: {
    key: "RETAIL",
    label: "Retail & General Stores",
    description: "General retail stores, department stores, and variety shops",
    icon: Store,
    emoji: "🏬",
    color: {
      primary: "slate-600",
      bg: "bg-slate-50 dark:bg-slate-950/20",
      border: "border-slate-200 dark:border-slate-800",
      badge:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      text: "text-slate-600 dark:text-slate-400",
    },
    productFields: [
      {
        key: "brand",
        label: "Brand",
        type: "text",
        required: false,
        dedicated: true,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "sku",
        label: "SKU",
        type: "text",
        required: false,
        dedicated: true,
        visibleIn: ["form", "detail"],
      },
      {
        key: "barcode",
        label: "Barcode",
        type: "text",
        required: false,
        dedicated: true,
        visibleIn: ["form"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: false,
      modifiers: false,
      bulkPricing: false,
      tableManagement: false,
      reservations: false,
      isbn: false,
    },
    cardStyle: "standard",
    posModifiers: false,
  },

  BAR: {
    key: "BAR",
    label: "Bar & Pub",
    description:
      "Bars, pubs, and establishments focused on alcoholic beverages",
    icon: Wine,
    emoji: "🍷",
    color: {
      primary: "purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      border: "border-purple-200 dark:border-purple-800",
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      text: "text-purple-600 dark:text-purple-400",
    },
    productFields: [
      {
        key: "volume",
        label: "Volume",
        type: "text",
        required: false,
        placeholder: "e.g., 330ml, 750ml",
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "alcoholContent",
        label: "ABV %",
        type: "number",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "origin",
        label: "Origin",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "servingTemp",
        label: "Serving Temp",
        type: "select",
        required: false,
        options: ["Chilled", "Room Temp", "Warm"],
        visibleIn: ["form", "pos"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: true,
      modifiers: true,
      bulkPricing: false,
      tableManagement: true,
      reservations: false,
      isbn: false,
    },
    cardStyle: "compact",
    posModifiers: true,
  },

  CLOTHING: {
    key: "CLOTHING",
    label: "Clothing & Accessories",
    description: "Clothing retailers, fashion boutiques, and accessory stores",
    icon: Shirt,
    emoji: "👕",
    color: {
      primary: "pink-600",
      bg: "bg-pink-50 dark:bg-pink-950/20",
      border: "border-pink-200 dark:border-pink-800",
      badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
      text: "text-pink-600 dark:text-pink-400",
    },
    productFields: [
      {
        key: "size",
        label: "Size",
        type: "select",
        required: true,
        options: ["XS", "S", "M", "L", "XL", "XXL"],
        visibleIn: ["form", "card", "detail", "pos"],
      },
      {
        key: "color",
        label: "Color",
        type: "text",
        required: false,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "material",
        label: "Material",
        type: "text",
        required: false,
        visibleIn: ["form", "detail"],
      },
      {
        key: "brand",
        label: "Brand",
        type: "text",
        required: false,
        dedicated: true,
        visibleIn: ["form", "card", "detail"],
      },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        required: false,
        options: ["Men", "Women", "Unisex", "Kids"],
        visibleIn: ["form", "card"],
      },
    ],
    features: {
      serialTracking: false,
      warrantyTracking: false,
      expiryTracking: false,
      modifiers: false,
      bulkPricing: false,
      tableManagement: false,
      reservations: false,
      isbn: false,
    },
    cardStyle: "standard",
    posModifiers: false,
  },
};

/** Ordered list for rendering in UI (marketplace filters, onboarding, etc.) */
export const BUSINESS_TYPE_LIST = Object.values(BUSINESS_TYPES);

/** Get config for a business type string, with fallback to RETAIL */
export function getBusinessTypeConfig(
  type: string | null | undefined,
): BusinessTypeConfig {
  if (!type) return BUSINESS_TYPES.RETAIL;
  return BUSINESS_TYPES[type.toUpperCase()] || BUSINESS_TYPES.RETAIL;
}

/** Get the display label for a business type */
export function getBusinessTypeLabel(type: string | null | undefined): string {
  return getBusinessTypeConfig(type).label;
}

/** Get the emoji for a business type */
export function getBusinessTypeEmoji(type: string | null | undefined): string {
  return getBusinessTypeConfig(type).emoji;
}

/** Get form-visible product fields for a business type */
export function getFormFields(
  type: string | null | undefined,
): ProductFieldConfig[] {
  return getBusinessTypeConfig(type).productFields.filter((f) =>
    f.visibleIn.includes("form"),
  );
}
