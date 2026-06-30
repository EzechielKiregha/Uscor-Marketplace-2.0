"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  statCount?: number;
  showChart?: boolean;
  showTable?: boolean;
}

function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <Skeleton className="h-5 w-36" />
      <div className="h-[300px] flex items-end gap-2 pt-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-2"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3 px-2"><Skeleton className="h-4 w-28" /></td>
      <td className="py-3 px-2"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 px-2"><Skeleton className="h-4 w-16" /></td>
      <td className="py-3 px-2"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="py-3 px-2"><Skeleton className="h-4 w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="h-8 w-24 rounded-md" /></td>
    </tr>
  );
}

export default function DashboardSkeleton({
  statCount = 4,
  showChart = true,
  showTable = true,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Store selector + button row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-full sm:w-64 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Chart area */}
      {showChart && <ChartSkeleton />}

      {/* Table area */}
      {showTable && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["w-20", "w-28", "w-24", "w-16", "w-20", "w-8", "w-24"].map(
                  (w, i) => (
                    <th key={i} className="py-3 px-2">
                      <Skeleton className={`h-4 ${w}`} />
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { StatCardSkeleton, ChartSkeleton, TableRowSkeleton };
