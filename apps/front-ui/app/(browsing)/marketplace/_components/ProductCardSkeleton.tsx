"use client";

import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  viewMode?: "grid" | "list";
  count?: number;
}

function SingleSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="flex gap-4 p-4 bg-card border border-border rounded-xl animate-pulse">
        <div className="h-28 w-28 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-muted" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Business name */}
        <div className="h-3 w-24 bg-muted rounded" />
        {/* Title */}
        <div className="h-4 w-3/4 bg-muted rounded" />
        {/* Description */}
        <div className="h-3 w-full bg-muted rounded" />
        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ProductCardSkeleton({
  viewMode = "grid",
  count = 8,
}: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
