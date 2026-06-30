"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface SidebarPageSkeletonProps {
  navItems?: number;
  contentVariant?: "cards" | "form" | "profile";
}

function NavItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

function ProfileContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>

      {/* Details section */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardsContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FormContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function SidebarPageSkeleton({
  navItems = 10,
  contentVariant = "profile",
}: SidebarPageSkeletonProps) {
  return (
    <div className="min-h-screen bg-background flex animate-in fade-in duration-300">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-card border-r border-border">
        <div className="p-4 space-y-1">
          {Array.from({ length: navItems }).map((_, i) => (
            <NavItemSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8">
        {contentVariant === "profile" && <ProfileContentSkeleton />}
        {contentVariant === "cards" && <CardsContentSkeleton />}
        {contentVariant === "form" && <FormContentSkeleton />}
      </div>
    </div>
  );
}
