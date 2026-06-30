"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
  columns?: 1 | 2;
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export default function FormSkeleton({
  fields = 6,
  showTitle = true,
  columns = 1,
}: FormSkeletonProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-in fade-in duration-300">
      {showTitle && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      )}

      <div
        className={
          columns === 2
            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
            : "space-y-4"
        }
      >
        {Array.from({ length: fields }).map((_, i) => (
          <FieldSkeleton key={i} />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}
