"use client";

import { useCart } from "@/app/context/use-cart";
import { useToast } from "@/components/toast-provider";
import { ArrowRight, Pause, Play, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import NewChatSession from "../../../../components/chat/NewChatSession";
import ProductDetailsModal from "./ProductDetailsModal";

interface FeaturedProductsCarouselProps {
  products: any[];
  onViewAll: () => void;
  /** ms per slide, default 5000 */
  interval?: number;
}

const DISMISS_KEY = "featured-carousel-dismissed";
const ROTATE_MS_DEFAULT = 5000;

export default function ProductsCarousel({
  products,
  onViewAll,
  interval = ROTATE_MS_DEFAULT,
}: FeaturedProductsCarouselProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden until we check sessionStorage (avoids flash)
  const [hydrated, setHydrated] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  const { addItem } = useCart();
  const { showToast } = useToast();

  const slides = products.slice(0, 8);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    setHydrated(true);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
      elapsedRef.current = 0;
      setProgress(0);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || dismissed || slides.length <= 1) return;

    const tick = (t: number) => {
      if (!startRef.current) startRef.current = t - elapsedRef.current;
      const elapsed = t - startRef.current;
      elapsedRef.current = elapsed;
      const pct = Math.min(elapsed / interval, 1);
      setProgress(pct);

      if (pct >= 1) {
        startRef.current = 0;
        elapsedRef.current = 0;
        setIndex((prev) => (prev + 1) % slides.length);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = 0;
    };
  }, [paused, dismissed, interval, slides.length, index]);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const handleRestore = () => {
    sessionStorage.removeItem(DISMISS_KEY);
    setDismissed(false);
    goTo(0);
  };

  if (!hydrated || slides.length === 0) return null;

  if (dismissed) {
    return (
      <button
        onClick={handleRestore}
        className="group flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground mb-2 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Show featured picks
        <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
      </button>
    );
  }

  const active = slides[index];
  const hasPromotion = active.promotions && active.promotions.length > 0;
  const promotion = hasPromotion ? active.promotions[0] : null;
  const discountedPrice = promotion
    ? active.price * (1 - promotion.discountPercentage / 100)
    : active.price;

  return (
    <section
      className="relative rounded-2xl overflow-hidden bg-neutral-950 group/carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress segments — story style */}
      <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden"
          >
            <div
              className="h-full bg-white rounded-full"
              style={{
                width:
                  i < index
                    ? "100%"
                    : i === index
                      ? `${progress * 100}%`
                      : "0%",
                transition: i === index ? "none" : "width 200ms ease",
              }}
            />
          </button>
        ))}
      </div>

      {/* Top-right controls */}
      <div className="absolute top-7 right-3 z-20 flex items-center gap-1.5">
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume rotation" : "Pause rotation"}
          className="h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/50 transition-colors"
        >
          {paused ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <Pause className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Hide featured picks"
          className="h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Slide */}
      <button
        onClick={() => setShowDetails(true)}
        className="relative w-full h-[320px] sm:h-[380px] text-left"
      >
        {active.medias?.[0]?.url ? (
          <img
            src={active.medias[0].url}
            alt={active.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            key={active.id}
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-800" />
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

        {/* Eyebrow */}
        <div className="absolute top-16 left-4 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-white/80">
          <Sparkles className="h-3 w-3 text-amber-400" />
          Featured pick
          {active.business?.name && (
            <span className="text-white/50 normal-case font-normal">
              · {active.business.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-lg sm:text-xl leading-tight line-clamp-2">
              {active.title}
            </h3>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-white font-bold text-base">
                ${discountedPrice.toFixed(2)}
              </span>
              {hasPromotion && (
                <>
                  <span className="text-white/50 text-sm line-through">
                    ${active.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-semibold bg-amber-400 text-black px-1.5 py-0.5 rounded">
                    -{promotion.discountPercentage}%
                  </span>
                </>
              )}
            </div>
          </div>

          <span className="shrink-0 h-10 px-4 rounded-full bg-white text-black text-sm font-semibold flex items-center gap-1.5 hover:bg-white/90 transition-colors">
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </button>

      {/* Prev/next hit zones (desktop hover reveal) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Previous"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Next"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* View all */}
      <button
        onClick={onViewAll}
        className="absolute bottom-4 right-4 sm:hidden text-[11px] text-white/70 underline underline-offset-2"
      >
        View all
      </button>

      {showDetails && (
        <ProductDetailsModal
          product={active}
          onClose={() => setShowDetails(false)}
          onAddToCart={() => {
            addItem(active);
            showToast(
              "success",
              "Added to Cart",
              `${active.title} has been added to your cart`,
            );
          }}
          onOpenChat={() => setOpenChat(true)}
        />
      )}
      <NewChatSession
        isOpen={openChat}
        onClose={() => setOpenChat(!openChat)}
        storeId={active?.store?.id}
        onChatCreated={() => {
          showToast(
            "success",
            "Chat Opened",
            "You can now chat with the business about this product",
            true,
            5000,
          );
        }}
      />
    </section>
  );
}
