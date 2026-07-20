"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getBusinessTypeConfig } from "@/config/business-types";
import { cn } from "@/lib/utils";
import TypedProductCard from "./TypedProductCard";

interface BusinessTypeShowcaseProps {
  businessType: string;
  products: any[];
}

export default function BusinessTypeShowcase({
  businessType,
  products,
}: BusinessTypeShowcaseProps) {
  const config = getBusinessTypeConfig(businessType);
  if (!products || products.length === 0) return null;

  const featured = products[0];

  return (
    <section
      className={cn(
        "rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center gap-4",
        config.color.bg,
        config.color.border,
      )}
    >
      {/* Info + CTA */}
      <div className="flex items-center gap-3 sm:min-w-[200px]">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            config.color.badge,
          )}
        >
          <config.icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-tight truncate">{config.label}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{products.length} products</p>
        </div>
        <Link
          href={`/marketplace?businessType=${businessType}`}
          className={cn(
            "hidden sm:flex items-center gap-1 text-xs font-medium hover:underline underline-offset-2 whitespace-nowrap ml-auto",
            config.color.text,
          )}
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Single recommended product */}
      <div className="flex-1 max-w-sm">
        <TypedProductCard product={featured} viewMode="grid" />
      </div>

      {/* Mobile CTA */}
      <Link
        href={`/marketplace?businessType=${businessType}`}
        className={cn(
          "sm:hidden flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg",
          config.color.badge,
        )}
      >
        View All {config.label}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </section>
  );
}
