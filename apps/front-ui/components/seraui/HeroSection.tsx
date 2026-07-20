"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Store, Zap } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-orange-500/8 dark:bg-orange-500/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-orange-600/5 dark:bg-orange-600/3 blur-[80px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-amber-500/5 dark:bg-amber-500/3 blur-[60px]" />
      </div>

      {/* Floating accent shapes */}
      <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-orange-400 animate-bounce-slow opacity-60 hidden lg:block" />
      <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-orange-500/40 animate-ping-slow hidden lg:block" />
      <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 rounded-full bg-orange-300 animate-bounce-slow opacity-40 hidden lg:block" />

      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200 dark:border-orange-800/50 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Platform Live — Serving local businesses
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
          The All-in-One Platform for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-500">
            Local Commerce
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Sell online, manage in-store with intelligent POS, hire freelancers, and grow
          your business — all from one platform built for African and global markets.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="px-8 h-12 text-base bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 transition-all">
            <Link href="/marketplace">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Explore Marketplace
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 h-12 text-base border-gray-300 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
          >
            <Link href="/signup">
              Start Your Business
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-100 dark:bg-orange-950/40">
              <Store className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">50+</p>
            <p className="text-xs text-muted-foreground">Local Businesses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-100 dark:bg-orange-950/40">
              <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">10K+</p>
            <p className="text-xs text-muted-foreground">Products Listed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-100 dark:bg-orange-950/40">
              <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">5K+</p>
            <p className="text-xs text-muted-foreground">Orders Delivered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
