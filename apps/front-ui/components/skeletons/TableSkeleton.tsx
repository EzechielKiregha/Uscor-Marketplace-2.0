"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

export default function TableSkeleton({
  columns = 5,
  rows = 8,
  showHeader = true,
  showActions = true,
}: TableSkeletonProps) {
  const colWidths = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-20", "w-24"];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search / filter bar */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Skeleton className="h-10 w-full sm:w-72 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3 px-4 text-left">
                  <Skeleton className={`h-4 ${colWidths[i % colWidths.length]}`} />
                </th>
              ))}
              {showActions && (
                <th className="py-3 px-4 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="border-b border-border last:border-0">
                {Array.from({ length: columns }).map((_, col) => (
                  <td key={col} className="py-3 px-4">
                    <Skeleton
                      className={`h-4 ${colWidths[col % colWidths.length]}`}
                    />
                  </td>
                ))}
                {showActions && (
                  <td className="py-3 px-4">
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
