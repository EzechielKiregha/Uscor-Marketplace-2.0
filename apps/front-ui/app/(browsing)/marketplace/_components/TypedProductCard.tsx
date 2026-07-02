"use client";

import { getBusinessTypeConfig } from "@/config/business-types";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import TypeSpecificFields from "./TypeSpecificFields";

interface TypedProductCardProps {
prodID?: string| null;
setProdID?: (id: string | null)=> void;
  product: any;
  viewMode: "grid" | "list";
}

/**
 * Type-aware wrapper around ProductCard.
 * Adds a colored top accent bar, subtle background tint,
 * and type-specific field badges below the card content.
 */
export default function TypedProductCard({
prodID,
setProdID,
  product,
  viewMode,
}: TypedProductCardProps) {
  const businessType = product.business?.businessType;
  const config = getBusinessTypeConfig(businessType);

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        config.color.border,
        "border",
      )}
    >
      {/* Type accent bar */}
      <div
        className={cn(
          "h-1",
          `bg-${config.color.primary}`,
        )}
      />

      {/* Core product card (border suppressed — this wrapper provides it) */}
      <ProductCard prodID={prodID} setProdID={setProdID} product={product} viewMode={viewMode} noBorder />

      {/* Type-specific field badges */}
      <TypeSpecificFields
        product={product}
        context="card"
        className="px-4 pb-3"
      />
    </div>
  );
}
