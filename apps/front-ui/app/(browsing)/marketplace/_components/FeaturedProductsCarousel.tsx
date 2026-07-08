"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { getBusinessTypeConfig } from "@/config/business-types";

interface FeaturedProductsCarouselProps {
  products: any[];
  onViewAll: () => void;
  onProductClick: (product: any) => void;
}

export default function FeaturedProductsCarousel({
  products,
  onViewAll,
  onProductClick,
}: FeaturedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
            Featured Products
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Handpicked products from top businesses
          </p>
        </div>
        <Button variant="link" onClick={onViewAll} className="text-orange-600">
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Carousel */}
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
          {products.map((product: any) => {
            const typeConfig = getBusinessTypeConfig(product.business?.businessType);
            const image = product.medias?.[0]?.url;
            const promotion = product.promotions?.[0];

            return (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="shrink-0 w-[200px] sm:w-[220px] bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-orange-300 transition-all group/card"
              >
                {/* Image */}
                <div className="relative h-40 bg-muted overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl">
                      {typeConfig.emoji}
                    </div>
                  )}
                  {promotion && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                      -{promotion.discountPercentage}%
                    </span>
                  )}
                  {product.featured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-500 text-white">
                      Featured
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-muted-foreground truncate">
                    {product.business?.name}
                  </p>
                  <h3 className="font-medium text-sm line-clamp-2 mt-0.5 leading-tight">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-base">
                      ${product.price?.toFixed(2)}
                    </span>
                    {promotion && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${(product.price / (1 - promotion.discountPercentage / 100)).toFixed(2)}
                      </span>
                    )}
                  </div>
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
