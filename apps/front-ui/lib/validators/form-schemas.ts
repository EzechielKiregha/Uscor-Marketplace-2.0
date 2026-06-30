import { z } from "zod";

// --- Business Profile ---
export const businessProfileSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{7,20}$/.test(val),
      "Please enter a valid phone number"
    ),
  country: z.string().min(1, "Please select a country"),
  businessType: z.string().min(1, "Please select a business type"),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
});

export type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

// --- Product ---
export const productSchema = z.object({
  title: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  minQuantity: z
    .number({ invalid_type_error: "Min quantity must be a number" })
    .int()
    .min(0, "Min quantity cannot be negative")
    .optional(),
  category: z.string().optional(),
  storeId: z.string().min(1, "Please select a store"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// --- Checkout / Shipping ---
export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number is required")
    .regex(/^\+?[\d\s\-()]{7,20}$/, "Please enter a valid phone number"),
  address: z.string().min(5, "Shipping address is required"),
  city: z.string().min(2, "City is required"),
  notes: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// --- Worker Profile ---
export const workerProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{7,20}$/.test(val),
      "Please enter a valid phone number"
    ),
});

export type WorkerProfileFormValues = z.infer<typeof workerProfileSchema>;

// --- Store ---
export const storeSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  address: z.string().min(3, "Store address is required"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]{7,20}$/.test(val),
      "Please enter a valid phone number"
    ),
});

export type StoreFormValues = z.infer<typeof storeSchema>;

// --- Inventory Adjustment ---
export const inventoryAdjustmentSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
  reason: z.string().optional(),
});

export type InventoryAdjustmentFormValues = z.infer<typeof inventoryAdjustmentSchema>;

// --- Platform Settings (Admin) ---
export const platformSettingsSchema = z.object({
  platformFeePercent: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Fee cannot be negative")
    .max(100, "Fee cannot exceed 100%"),
  minWithdrawalAmount: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Amount cannot be negative"),
  maxWithdrawalAmount: z
    .number({ invalid_type_error: "Must be a number" })
    .positive("Amount must be greater than 0"),
});

export type PlatformSettingsFormValues = z.infer<typeof platformSettingsSchema>;
