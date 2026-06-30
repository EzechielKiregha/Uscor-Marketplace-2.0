"use client";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { BUSINESS_TYPES, isDedicatedField, type ProductFieldConfig } from "@/config/business-types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CREATE_CATEGORY, GET_CATEGORIES } from "@/graphql/category.gql";
import {
  CREATE_PRODUCT,
  GET_PRODUCTS,
  GET_PRODUCTS_BY_BUSINESS_ID,
  UPDATE_PRODUCT,
} from "@/graphql/product.gql";
import { GET_STORES } from "@/graphql/store.gql";
import { BusinessEntity, StoreEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@apollo/client";
import { put } from "@vercel/blob";
import {
  Baby,
  BookOpen,
  Boxes,
  ChevronDown,
  Coffee,
  Dumbbell,
  Flower2,
  Gamepad2,
  Gem,
  Hammer,
  HeartPulse,
  Home,
  ImageIcon,
  Laptop,
  LucideIcon,
  Palette,
  Plug,
  Sandwich,
  Shirt,
  ShoppingCart,
  Sofa,
  Sparkles,
  Store,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Category definitions per business type ──────────────────────────────────

interface CategoryMock {
  id: string; // used as the "name" seed when creating; swap to real id after fetch
  label: string;
  icon: LucideIcon;
  color: string; // tailwind bg class for the icon chip
}

const CATEGORIES_BY_BUSINESS_TYPE: Record<string, CategoryMock[]> = {
  ELECTRONICS: [
    {
      id: "phones",
      label: "Phones & Tablets",
      icon: Laptop,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "accessories",
      label: "Accessories",
      icon: Plug,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
    },
    {
      id: "computers",
      label: "Computers",
      icon: Laptop,
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      id: "audio",
      label: "Audio & Video",
      icon: Gamepad2,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      id: "gaming",
      label: "Gaming",
      icon: Gamepad2,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
    },
    {
      id: "other",
      label: "Other",
      icon: Boxes,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    },
  ],
  GROCERY: [
    {
      id: "fresh",
      label: "Fresh Produce",
      icon: Flower2,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      id: "dairy",
      label: "Dairy & Eggs",
      icon: ShoppingCart,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "bakery",
      label: "Bakery",
      icon: Sandwich,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    },
    {
      id: "beverages",
      label: "Beverages",
      icon: Coffee,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "snacks",
      label: "Snacks",
      icon: Sandwich,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    },
    {
      id: "other",
      label: "Other",
      icon: Boxes,
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  ],
  CLOTHING: [
    {
      id: "mens",
      label: "Men's",
      icon: Shirt,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "womens",
      label: "Women's",
      icon: Shirt,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
    },
    {
      id: "kids",
      label: "Kids",
      icon: Baby,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "footwear",
      label: "Footwear",
      icon: Shirt,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    },
    {
      id: "accessories",
      label: "Accessories",
      icon: Gem,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
    },
    {
      id: "sportswear",
      label: "Sportswear",
      icon: Dumbbell,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
  ],
  RESTAURANT: [
    {
      id: "starters",
      label: "Starters",
      icon: UtensilsCrossed,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    },
    {
      id: "mains",
      label: "Main Course",
      icon: UtensilsCrossed,
      color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    },
    {
      id: "desserts",
      label: "Desserts",
      icon: Sparkles,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
    },
    {
      id: "drinks",
      label: "Drinks",
      icon: Wine,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
    },
    {
      id: "combos",
      label: "Combos",
      icon: Boxes,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "specials",
      label: "Daily Specials",
      icon: Sparkles,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
  ],
  CAFE: [
    {
      id: "coffee",
      label: "Coffee",
      icon: Coffee,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    },
    {
      id: "teas",
      label: "Teas",
      icon: Coffee,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      id: "pastries",
      label: "Pastries",
      icon: Sandwich,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "sandwiches",
      label: "Sandwiches",
      icon: Sandwich,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    },
    {
      id: "cold-drinks",
      label: "Cold Drinks",
      icon: Coffee,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "other",
      label: "Other",
      icon: Boxes,
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  ],
  ARTISAN: [
    {
      id: "handmade",
      label: "Handmade",
      icon: Palette,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
    },
    {
      id: "art",
      label: "Art & Prints",
      icon: Palette,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
    },
    {
      id: "jewelry",
      label: "Jewelry",
      icon: Gem,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "decor",
      label: "Home Décor",
      icon: Home,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      id: "textiles",
      label: "Textiles",
      icon: Shirt,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "other",
      label: "Other",
      icon: Boxes,
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  ],
  BOOKSTORE: [
    {
      id: "fiction",
      label: "Fiction",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "non-fiction",
      label: "Non-Fiction",
      icon: BookOpen,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      id: "academic",
      label: "Academic",
      icon: BookOpen,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "children",
      label: "Children's",
      icon: Baby,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
    },
    {
      id: "comics",
      label: "Comics & Manga",
      icon: Gamepad2,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    },
    {
      id: "stationery",
      label: "Stationery",
      icon: Palette,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
    },
  ],
  HARDWARE: [
    {
      id: "tools",
      label: "Tools",
      icon: Hammer,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    },
    {
      id: "electrical",
      label: "Electrical",
      icon: Plug,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "plumbing",
      label: "Plumbing",
      icon: Hammer,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "paint",
      label: "Paint & Finishes",
      icon: Palette,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
    },
    {
      id: "safety",
      label: "Safety",
      icon: HeartPulse,
      color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    },
    {
      id: "other",
      label: "Other",
      icon: Boxes,
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  ],
  BAR: [
    {
      id: "beer",
      label: "Beer & Cider",
      icon: Wine,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    },
    {
      id: "wine",
      label: "Wine",
      icon: Wine,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
    },
    {
      id: "spirits",
      label: "Spirits",
      icon: Wine,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
    },
    {
      id: "cocktails",
      label: "Cocktails",
      icon: Wine,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "snacks",
      label: "Bar Snacks",
      icon: Sandwich,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "soft",
      label: "Soft Drinks",
      icon: Coffee,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
  ],
  RETAIL: [
    {
      id: "personal-care",
      label: "Personal Care",
      icon: Sparkles,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
    },
    {
      id: "home",
      label: "Home & Living",
      icon: Sofa,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    {
      id: "health",
      label: "Health",
      icon: HeartPulse,
      color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    },
    {
      id: "sports",
      label: "Sports & Outdoors",
      icon: Dumbbell,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
      id: "toys",
      label: "Toys & Games",
      icon: Gamepad2,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    {
      id: "other",
      label: "Other",
      icon: Boxes,
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  ],
};

const DEFAULT_CATEGORIES: CategoryMock[] = [
  {
    id: "general",
    label: "General",
    icon: Store,
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    id: "other",
    label: "Other",
    icon: Boxes,
    color:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
  },
];

// ─── CategoryGrid ─────────────────────────────────────────────────────────────

interface CategoryGridProps {
  businessType: string;
  /** The real category id once matched from server data */
  selectedCatId: string | null;
  /** Server-side categories (from GET_CATEGORIES) */
  serverCategories: Array<{ id: string; name: string }>;
  onChange: (catId: string) => void;
  /** If no match found, open the create dialog */
  onCreateRequest: (suggestedName: string) => void;
}

function CategoryGrid({
  businessType,
  selectedCatId,
  serverCategories,
  onChange,
  onCreateRequest,
}: CategoryGridProps) {
  const mocks =
    CATEGORIES_BY_BUSINESS_TYPE[businessType?.toUpperCase?.()] ??
    DEFAULT_CATEGORIES;

  const resolveId = (mock: CategoryMock): string | null => {
    const match = serverCategories.find(
      (c) => c.name.toLowerCase() === mock.label.toLowerCase(),
    );
    return match?.id ?? null;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {mocks.map((mock) => {
        const Icon = mock.icon;
        const resolvedId = resolveId(mock);
        const isSelected = resolvedId !== null && selectedCatId === resolvedId;

        return (
          <button
            key={mock.id}
            type="button"
            onClick={() => {
              if (resolvedId) {
                onChange(resolvedId);
              } else {
                onCreateRequest(mock.label);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
              "hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20",
              isSelected
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-1 ring-orange-400"
                : "border-border bg-background",
              !resolvedId && "opacity-50 cursor-not-allowed",
            )}
            title={
              !resolvedId
                ? `"${mock.label}" doesn't exist yet — click to create it`
                : undefined
            }
          >
            <span className={cn("p-1 rounded-md", mock.color)}>
              <Icon className="size-3.5" />
            </span>
            <span className="truncate">{mock.label}</span>
            {!resolvedId && (
              <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                + new
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── CreateCategoryDialog ─────────────────────────────────────────────────────

interface CreateCategoryDialogProps {
  open: boolean;
  suggestedName: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

function CreateCategoryDialog({
  open,
  suggestedName,
  onOpenChange,
  onCreated,
}: CreateCategoryDialogProps) {
  const { showToast } = useToast();
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(suggestedName);
  const [desc, setDesc] = useState("");

  // Sync suggested name when it changes
  useEffect(() => setName(suggestedName), [suggestedName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await createCategory({
        variables: {
          createCategoryInput: { name: name.trim(), description: desc.trim() },
        },
        refetchQueries: [{ query: GET_CATEGORIES }],
      });
      const newId = result.data?.createCategory?.id;
      showToast("success", "Category created", name);
      if (newId) onCreated(newId);
      onOpenChange(false);
    } catch (err: any) {
      showToast("error", "Error", err.message ?? "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create product category</DialogTitle>
          <DialogDescription>
            This category doesn&apos;t exist yet. Fill in the details and save.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="catName">Name</Label>
              <Input
                id="catName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="catDesc">Description</Label>
              <Input
                id="catDesc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── ImageUploadGrid ──────────────────────────────────────────────────────────

interface ImageUploadGridProps {
  files: Array<File | string>;
  uploading: boolean;
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
}

function ImageUploadGrid({
  files,
  uploading,
  onAdd,
  onRemove,
}: ImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label>Product Images</Label>
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WEBP or JPEG · max 5MB each · up to 6 images
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {files.map((f, i) => {
          const src = f instanceof File ? URL.createObjectURL(f) : f;
          return (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden border border-border group"
            >
              <Image
                src={src}
                alt={`product-img-${i}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
              {uploading && f instanceof File && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          );
        })}

        {files.length < 6 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-orange-400/60 flex flex-col items-center justify-center gap-1",
              "text-muted-foreground hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors",
              uploading && "opacity-50 cursor-not-allowed",
            )}
          >
            <ImageIcon className="size-5" />
            <span className="text-[11px]">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => e.target.files && onAdd(e.target.files)}
      />
    </div>
  );
}

// ─── ProductForm ──────────────────────────────────────────────────────────────

interface ProductFormProps {
  initialData?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const { user, role } = useMe();
  const { showToast } = useToast();
  const [businessType, setBusinessType] = useState("ELECTRONICS");

  // ── Images ────────────────────────────────────────────────────────────────
  const [imageFiles, setImageFiles] = useState<Array<File | string>>(
    initialData?.medias?.map((m: any) => m.url) ?? [],
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleAddImages = (fileList: FileList) => {
    const incoming = Array.from(fileList).slice(0, 6 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...incoming]);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Category ──────────────────────────────────────────────────────────────
  const [selectedCatId, setSelectedCatId] = useState<string | null>(
    initialData?.categoryId ?? null,
  );
  const [createCatDialogOpen, setCreateCatDialogOpen] = useState(false);
  const [suggestedCatName, setSuggestedCatName] = useState("");

  // ── Store / form state ────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? "",
    quantity: initialData?.quantity ?? "",
    isPhysical: initialData?.isPhysical ?? true,
    approvedForSale: initialData?.approvedForSale ?? true,
    featured: initialData?.featured ?? false,
    storeId: initialData?.storeId ?? "",
  });

  // Type-specific fields (initialized from dedicated columns + variants JSON)
  const [typeFields, setTypeFields] = useState<Record<string, any>>(() => {
    if (!initialData) return {};
    const fields: Record<string, any> = {};
    // Pull dedicated columns
    for (const key of ["brand", "serialNumber", "imei", "warrantyMonths", "sku", "barcode"]) {
      if (initialData[key] != null) fields[key] = initialData[key];
    }
    // Pull variants JSON
    if (initialData.variants && typeof initialData.variants === "object") {
      Object.assign(fields, initialData.variants);
    }
    return fields;
  });
  const [typeFieldsOpen, setTypeFieldsOpen] = useState(true);

  const { data: storesData, loading: storesLoading } = useQuery(GET_STORES);
  const { data: catData, loading: catLoading } = useQuery(GET_CATEGORIES);

  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [GET_PRODUCTS_BY_BUSINESS_ID, GET_PRODUCTS],
  });
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [GET_PRODUCTS_BY_BUSINESS_ID, GET_PRODUCTS],
  });

  // Auto-select first store
  useEffect(() => {
    if (storesData?.stores?.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  useEffect(() => {
    if (user) {
      const type = (user as BusinessEntity).businessType;
      setBusinessType(type!);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // ── Validation guard ──────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!formData.title.trim()) return "Product name is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (!formData.price || isNaN(parseFloat(formData.price)))
      return "A valid price is required.";
    if (!formData.quantity || isNaN(parseInt(formData.quantity, 10)))
      return "A valid stock quantity is required.";
    if (!selectedCatId) return "Please select a category.";
    if (!selectedStoreId && !formData.storeId) return "Please select a store.";
    if (imageFiles.length === 0)
      return "Please add at least one product image.";
    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      showToast("error", "Validation", error);
      return;
    }

    setIsSubmitting(true);

    try {
      const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;

      setIsUploading(true);
      const mediaInputs = await Promise.all(
        imageFiles.map(async (f) => {
          if (typeof f === "string") {
            return {
              url: f,
              pathname: f.split(".com/")[1] ?? f,
              type: "image/jpeg",
              size: 0,
            };
          }
          if (!blobToken)
            throw new Error("NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN is missing.");
          const blob = await put(
            `business/products/medias/${Date.now()}-${f.name}`,
            f,
            { access: "public", token: blobToken },
          );
          return {
            url: blob.url,
            pathname: blob.pathname,
            type: f.type,
            size: f.size,
          };
        }),
      );
      setIsUploading(false);

      // Split type-specific fields into dedicated columns vs. variants JSON
      const dedicatedFields: Record<string, any> = {};
      const variantsJson: Record<string, any> = {};
      for (const [key, value] of Object.entries(typeFields)) {
        if (value === "" || value == null) continue;
        if (isDedicatedField(key)) {
          dedicatedFields[key] = value;
        } else {
          variantsJson[key] = value;
        }
      }

      const productData = {
        ...formData,
        businessId: user?.id,
        storeId: selectedStoreId ?? formData.storeId,
        categoryId: selectedCatId,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        ...dedicatedFields,
        variants: Object.keys(variantsJson).length > 0 ? variantsJson : undefined,
      };

      if (initialData) {
        await updateProduct({
          variables: { id: initialData.id, input: productData, mediaInputs },
        });
        showToast("success", "Success", "Product updated successfully");
      } else {
        await createProduct({
          variables: { input: productData, mediaInputs },
        });
        showToast("success", "Success", "Product created successfully");
      }

      onSuccess();
    } catch (err: any) {
      showToast("error", "Error", err.message ?? "Something went wrong");
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
              required
            />
          </div>

          {/* Price + Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                required
              />
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium mb-1"
              >
                Stock Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                required
              />
            </div>
          </div>

          {/* ── Type-Specific Fields ── */}
          {(() => {
            const config = BUSINESS_TYPES[businessType?.toUpperCase?.()];
            const formFields = config?.productFields?.filter((f: ProductFieldConfig) =>
              f.visibleIn.includes("form"),
            );
            if (!formFields || formFields.length === 0) return null;

            return (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setTypeFieldsOpen(!typeFieldsOpen)}
                  className="flex items-center gap-2 text-sm font-medium w-full"
                >
                  <div
                    className={cn(
                      "p-1 rounded-md",
                      config.color.badge,
                    )}
                  >
                    <config.icon className="size-3.5" />
                  </div>
                  <span>{config.label} Details</span>
                  <ChevronDown
                    className={cn(
                      "size-4 ml-auto transition-transform",
                      typeFieldsOpen && "rotate-180",
                    )}
                  />
                </button>

                {typeFieldsOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                    {formFields.map((field: ProductFieldConfig) => (
                      <div key={field.key}>
                        <label
                          htmlFor={`tf-${field.key}`}
                          className="block text-sm font-medium mb-1"
                        >
                          {field.label}
                          {field.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </label>

                        {field.type === "text" && (
                          <input
                            type="text"
                            id={`tf-${field.key}`}
                            value={typeFields[field.key] ?? ""}
                            onChange={(e) =>
                              setTypeFields((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            placeholder={field.placeholder}
                            className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md text-sm"
                          />
                        )}

                        {field.type === "number" && (
                          <input
                            type="number"
                            id={`tf-${field.key}`}
                            value={typeFields[field.key] ?? ""}
                            onChange={(e) =>
                              setTypeFields((prev) => ({
                                ...prev,
                                [field.key]: e.target.value ? Number(e.target.value) : "",
                              }))
                            }
                            placeholder={field.placeholder}
                            min="0"
                            className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md text-sm"
                          />
                        )}

                        {field.type === "select" && (
                          <select
                            id={`tf-${field.key}`}
                            value={typeFields[field.key] ?? ""}
                            onChange={(e) =>
                              setTypeFields((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-muted text-sm"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === "boolean" && (
                          <label className="flex items-center gap-2 text-sm cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              id={`tf-${field.key}`}
                              checked={!!typeFields[field.key]}
                              onChange={(e) =>
                                setTypeFields((prev) => ({
                                  ...prev,
                                  [field.key]: e.target.checked,
                                }))
                              }
                              className="h-4 w-4 text-primary border-border rounded"
                            />
                            {field.label}
                          </label>
                        )}

                        {field.type === "date" && (
                          <input
                            type="date"
                            id={`tf-${field.key}`}
                            value={typeFields[field.key] ?? ""}
                            onChange={(e) =>
                              setTypeFields((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Category Grid ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Category</label>
              {!selectedCatId && (
                <span className="text-xs text-destructive">Required</span>
              )}
            </div>

            {catLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading categories…
              </p>
            ) : (
              <CategoryGrid
                businessType={businessType}
                selectedCatId={selectedCatId}
                serverCategories={catData?.categories ?? []}
                onChange={setSelectedCatId}
                onCreateRequest={(name) => {
                  setSuggestedCatName(name);
                  setCreateCatDialogOpen(true);
                }}
              />
            )}

            <p className="text-xs text-muted-foreground">
              Don&apos;t see what you need?{" "}
              <button
                type="button"
                className="underline underline-offset-2 text-primary"
                onClick={() => {
                  setSuggestedCatName("");
                  setCreateCatDialogOpen(true);
                }}
              >
                Create a custom category
              </button>
            </p>
          </div>

          {/* Store */}
          <div>
            <label htmlFor="storeId" className="block text-sm font-medium mb-1">
              Store
            </label>
            <select
              id="storeId"
              name="storeId"
              value={formData.storeId}
              onChange={(e) => {
                handleChange(e);
                setSelectedStoreId(e.target.value);
              }}
              required
              className="w-full sm:w-64 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {!storesData && !storesLoading && (
                <option disabled>No stores found</option>
              )}
              {storesData?.stores.map((store: StoreEntity) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                  {store.address ? ` • ${store.address}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Flags */}
          <div className="flex flex-row items-center flex-wrap gap-x-4 gap-y-2">
            {(
              [
                { id: "featured", label: "Featured Product" },
                { id: "approvedForSale", label: "Approved for Sale" },
                { id: "isPhysical", label: "Physical Product" },
              ] as const
            ).map(({ id, label }) => (
              <label
                key={id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  id={id}
                  name={id}
                  checked={formData[id]}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-border rounded"
                />
                {label}
              </label>
            ))}
          </div>

          {/* ── Multi-image upload ── */}
          <ImageUploadGrid
            files={imageFiles}
            uploading={isUploading}
            onAdd={handleAddImages}
            onRemove={handleRemoveImage}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-accent text-primary-foreground"
            disabled={isSubmitting || isUploading}
          >
            {isUploading
              ? "Uploading images…"
              : isSubmitting
                ? "Submitting…"
                : initialData
                  ? "Update Product"
                  : "Create Product"}
          </Button>
        </div>
      </form>

      {/* Create category dialog — outside <form> to avoid nested form submission */}
      <CreateCategoryDialog
        open={createCatDialogOpen}
        suggestedName={suggestedCatName}
        onOpenChange={setCreateCatDialogOpen}
        onCreated={(id) => setSelectedCatId(id)}
      />
    </>
  );
}
