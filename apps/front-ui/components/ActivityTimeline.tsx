"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    CheckCircle2,
    DollarSign,
    MessageSquare,
    Minus,
    Package,
    Plus,
    RefreshCw,
    ShoppingCart,
    Truck,
    User,
    XCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: LucideIcon;
  status?: "completed" | "active" | "pending";
  actor?: string;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
  className?: string;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Preset icons
// ---------------------------------------------------------------------------

export const timelineIcons = {
  orderPlaced: ShoppingCart,
  orderProcessing: Package,
  orderShipped: Truck,
  orderDelivered: CheckCircle2,
  orderCancelled: XCircle,
  paymentReceived: DollarSign,
  paymentRefunded: RefreshCw,
  inventoryAdded: Plus,
  inventoryRemoved: Minus,
  statusChange: ArrowRight,
  noteAdded: MessageSquare,
  userAction: User,
} as const;

// ---------------------------------------------------------------------------
// Helper: build order‑lifecycle timeline items from a status string
// ---------------------------------------------------------------------------

export function buildOrderTimelineItems(
  status: string,
  createdAt?: string | Date,
): TimelineItem[] {
  const ts = createdAt ? new Date(createdAt) : new Date();
  const s = status.toUpperCase();

  if (s === "CANCELLED") {
    return [
      {
        id: "placed",
        title: "Order Placed",
        timestamp: ts,
        icon: timelineIcons.orderPlaced,
        status: "completed",
      },
      {
        id: "cancelled",
        title: "Order Cancelled",
        timestamp: ts,
        icon: timelineIcons.orderCancelled,
        status: "completed",
      },
    ];
  }

  const steps: TimelineItem[] = [
    {
      id: "placed",
      title: "Order Placed",
      timestamp: ts,
      icon: timelineIcons.orderPlaced,
      status: "completed",
    },
    {
      id: "processing",
      title: "Processing Started",
      timestamp: ts,
      icon: timelineIcons.orderProcessing,
      status: "pending",
    },
    {
      id: "shipped",
      title: "Shipped",
      timestamp: ts,
      icon: timelineIcons.orderShipped,
      status: "pending",
    },
    {
      id: "delivered",
      title: "Delivered",
      timestamp: ts,
      icon: timelineIcons.orderDelivered,
      status: "pending",
    },
  ];

  const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "DELIVERED"];
  const idx = statusOrder.indexOf(s);

  // Mark steps completed / active based on how far the order has progressed
  // idx 0 = PENDING   → only step 0 completed
  // idx 1 = PROCESSING → step 0 completed, step 1 active
  // idx 2 = SHIPPED   → 0,1 completed, step 2 active
  // idx 3/4 = COMPLETED/DELIVERED → all completed
  steps.forEach((step, i) => {
    if (i === 0) {
      // "Order Placed" is always completed once order exists
      step.status = "completed";
    } else if (idx >= 3) {
      // COMPLETED / DELIVERED — everything done
      step.status = "completed";
    } else if (i < idx + 1) {
      step.status = "completed";
    } else if (i === idx + 1) {
      // The step that just became relevant
      step.status = idx >= 1 ? "active" : "pending";
    } else {
      step.status = "pending";
    }
  });

  // For PENDING, processing is still pending (not active)
  if (s === "PENDING") {
    steps[1].status = "pending";
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Relative time formatter
// ---------------------------------------------------------------------------

function formatRelativeTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActivityTimeline({
  items,
  className,
  compact = false,
}: ActivityTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className={cn(
              "relative flex gap-3",
              compact ? "pb-3" : "pb-5",
              isLast && "pb-0",
            )}
          >
            {/* Connecting line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[11px] bg-linear-to-b from-orange-400 to-orange-600",
                  compact
                    ? "top-[22px] bottom-0 w-[2px]"
                    : "top-[26px] bottom-0 w-[2px]",
                )}
              />
            )}

            {/* Dot / icon circle */}
            <div
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center rounded-full",
                compact ? "h-[22px] w-[22px]" : "h-[26px] w-[26px]",
                item.status === "completed" &&
                  "bg-orange-500 text-white",
                item.status === "active" &&
                  "border-2 border-orange-500 bg-background",
                item.status === "pending" &&
                  "border-2 border-muted-foreground/30 bg-muted",
              )}
            >
              {/* Pulse ring for active */}
              {item.status === "active" && (
                <span className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-40" />
              )}

              {Icon ? (
                <Icon
                  className={cn(
                    compact ? "h-3 w-3" : "h-3.5 w-3.5",
                    item.status === "completed" && "text-white",
                    item.status === "active" && "text-orange-500",
                    item.status === "pending" && "text-muted-foreground/50",
                  )}
                />
              ) : (
                <span
                  className={cn(
                    "rounded-full",
                    compact ? "h-2 w-2" : "h-2.5 w-2.5",
                    item.status === "completed" && "bg-white",
                    item.status === "active" && "bg-orange-500",
                    item.status === "pending" && "bg-muted-foreground/30",
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("min-w-0 flex-1", compact ? "pt-0.5" : "pt-1")}>
              <p
                className={cn(
                  "font-semibold leading-tight",
                  compact ? "text-sm" : "text-sm",
                  item.status === "pending" && "text-muted-foreground",
                )}
              >
                {item.title}
              </p>

              {item.description && (
                <p
                  className={cn(
                    "text-muted-foreground mt-0.5",
                    compact ? "text-xs" : "text-xs",
                  )}
                >
                  {item.description}
                </p>
              )}

              <div
                className={cn(
                  "flex items-center gap-2 mt-0.5 text-muted-foreground",
                  compact ? "text-[11px]" : "text-xs",
                )}
              >
                <span>{formatRelativeTime(item.timestamp)}</span>
                {item.actor && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span>by {item.actor}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
