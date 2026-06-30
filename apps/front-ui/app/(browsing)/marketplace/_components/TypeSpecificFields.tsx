"use client";

import {
  getBusinessTypeConfig,
  type ProductFieldConfig,
} from "@/config/business-types";
import { Shield, Calendar, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypeSpecificFieldsProps {
  product: any;
  /** Which visibility context to filter for */
  context: "card" | "detail";
  className?: string;
}

/**
 * Merges dedicated Prisma columns + variants JSON into a flat map,
 * then renders the fields visible in the given context as badges/chips.
 */
export default function TypeSpecificFields({
  product,
  context,
  className,
}: TypeSpecificFieldsProps) {
  const businessType = product.business?.businessType;
  const config = getBusinessTypeConfig(businessType);
  if (!config.productFields || config.productFields.length === 0) return null;

  // Build a flat data map from dedicated columns + variants JSON
  const data: Record<string, any> = {};
  for (const key of ["brand", "serialNumber", "imei", "warrantyMonths", "sku", "barcode"]) {
    if (product[key] != null && product[key] !== "") data[key] = product[key];
  }
  if (product.variants && typeof product.variants === "object") {
    Object.assign(data, product.variants);
  }

  // Filter fields visible in this context that have data
  const visibleFields = config.productFields.filter(
    (f: ProductFieldConfig) =>
      f.visibleIn.includes(context) && data[f.key] != null && data[f.key] !== "",
  );

  if (visibleFields.length === 0) return null;

  if (context === "card") {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {visibleFields.slice(0, 3).map((field: ProductFieldConfig) => (
          <span
            key={field.key}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
              config.color.badge,
            )}
          >
            {field.key === "warrantyMonths" && <Shield className="size-2.5" />}
            {field.key === "expiryDate" && <Calendar className="size-2.5" />}
            {field.key === "serialNumber" && <Hash className="size-2.5" />}
            {formatFieldValue(field, data[field.key])}
          </span>
        ))}
      </div>
    );
  }

  // Detail context — full labeled list
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <config.icon className="size-4" />
        {config.label} Details
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {visibleFields.map((field: ProductFieldConfig) => (
          <div key={field.key} className="flex flex-col">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
              {field.label}
            </span>
            <span className="text-sm font-medium">
              {formatFieldValue(field, data[field.key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFieldValue(field: ProductFieldConfig, value: any): string {
  if (value == null || value === "") return "";
  if (field.type === "boolean") return value ? "Yes" : "No";
  if (field.key === "warrantyMonths") return `${value}mo warranty`;
  if (field.key === "alcoholContent") return `${value}% ABV`;
  if (field.key === "prepTime") return `${value} min`;
  if (field.key === "productionTime") return `${value} days`;
  if (field.key === "pages") return `${value} pages`;
  if (field.key === "calories") return `${value} cal`;
  if (field.key === "expiryDate") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
  return String(value);
}
