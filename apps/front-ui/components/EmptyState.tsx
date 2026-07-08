"use client";

import {
    AlertTriangle,
    ClipboardList,
    Clock,
    DollarSign,
    FileText,
    Heart,
    type LucideIcon,
    MessageSquare,
    Package,
    Search,
    ShoppingBag,
    ShoppingCart,
    Store,
    TrendingUp,
    Truck,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  compact?: boolean;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-6",
        "bg-card border border-border rounded-xl",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-muted/50 flex items-center justify-center mb-4",
          compact ? "w-12 h-12" : "w-16 h-16"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            compact ? "h-6 w-6" : "h-8 w-8"
          )}
        />
      </div>
      <h3
        className={cn(
          "font-medium mb-1",
          compact ? "text-base" : "text-lg"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm",
            compact ? "text-xs mb-3" : "text-sm mb-6"
          )}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button
              variant={action.variant ?? "default"}
              size={compact ? "sm" : "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant ?? "outline"}
              size={compact ? "sm" : "default"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// --- Preset icons for common empty states ---
// Usage: <EmptyState icon={emptyStateIcons.products} title="..." />
export const emptyStateIcons = {
  products: Package,
  orders: ShoppingBag,
  cart: ShoppingCart,
  stores: Store,
  customers: Users,
  chat: MessageSquare,
  sales: DollarSign,
  inventory: ClipboardList,
  shifts: Clock,
  reports: FileText,
  favorites: Heart,
  search: Search,
  revenue: TrendingUp,
  transfers: Truck,
  warnings: AlertTriangle,
  users: Users
} as const;
