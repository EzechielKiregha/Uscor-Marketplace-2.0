"use client";

import { getBusinessTypeConfig } from "@/config/business-types";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import TypedProductCard from "./TypedProductCard";

interface BusinessTypeShowcaseProps {
  businessType: string;
  products: any[];
}

/**
 * Horizontal showcase section for a single business type.
 * Displays up to 4 products with type-specific accent styling
 * and a "View All" link that filters the marketplace.
 */
export default function BusinessTypeShowcase({
  businessType,
  products,
}: BusinessTypeShowcaseProps) {
  const config = getBusinessTypeConfig(businessType);
  if (!products || products.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-xl p-5 mb-6 border",
        config.color.bg,
        config.color.border,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              config.color.badge,
            )}
          >
            <config.icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">{config.label}</h2>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Link
          href={`/marketplace?businessType=${businessType}`}
          className={cn(
            "flex items-center gap-1 text-sm font-medium hover:underline underline-offset-2",
            config.color.text,
          )}
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product: any) => (
          <TypedProductCard
            key={product.id}
            product={product}
            viewMode="grid"
          />
        ))}
      </div>
    </section>
  );
}
