"use client";

import { useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_STORES } from "@/graphql/marketplace.gql";
import { getBusinessTypeConfig } from "@/config/business-types";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FeaturedStoresSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, loading } = useQuery(GET_FEATURED_STORES, {
    variables: { limit: 8 },
  });

  const stores = data?.featuredStores?.items || [];

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Store className="h-5 w-5 text-orange-500" />
            Featured Stores
          </h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[240px] h-[160px] rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Store className="h-5 w-5 text-orange-500" />
            Featured Stores
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Top verified businesses on USCOR
          </p>
        </div>
        <Button
          variant="link"
          onClick={() => router.push("/all-businesses")}
          className="text-orange-600"
        >
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {stores.map((store: any) => {
            const typeConfig = getBusinessTypeConfig(store.businessType);
            const Icon = typeConfig.icon;

            return (
              <div
                key={store.id}
                onClick={() => router.push(`/b-view/${store.id}`)}
                className="shrink-0 w-[240px] bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-orange-300 transition-all"
              >
                {/* Avatar + name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                    {store.avatar ? (
                      <img
                        src={store.avatar}
                        alt={store.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">{typeConfig.emoji}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate flex items-center gap-1">
                      {store.name}
                      {store.isVerified && (
                        <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                    </h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md ${typeConfig.color.badge}`}>
                      <Icon className="h-3 w-3" />
                      {typeConfig.label}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{store.productCount} products</span>
                  <span>{store.totalSales} sales</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
