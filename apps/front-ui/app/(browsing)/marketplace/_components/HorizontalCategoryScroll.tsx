"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { BUSINESS_TYPE_LIST } from "@/config/business-types";
import { cn } from "@/lib/utils";

interface HorizontalCategoryScrollProps {
  selected: string;
  onSelect: (businessType: string) => void;
}

export default function HorizontalCategoryScroll({
  selected,
  onSelect,
}: HorizontalCategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group">
      {/* Left scroll button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* All pill */}
        <button
          onClick={() => onSelect("")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap text-sm font-medium transition-all shrink-0",
            !selected
              ? "bg-orange-500 text-white border-orange-500 shadow-md"
              : "bg-card border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20"
          )}
        >
          All
        </button>

        {BUSINESS_TYPE_LIST.map((bt) => {
          const Icon = bt.icon;
          const isActive = selected === bt.key;

          return (
            <button
              key={bt.key}
              onClick={() => onSelect(bt.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap text-sm font-medium transition-all shrink-0",
                isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-card border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {bt.label}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
