'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // or use your own Button

export default function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Background gradients (themed with --accent / --primary) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 dark:bg-accent/20 blur-3xl"></div>
      </div>

      {/* Hero Content */}
      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-primary-foreground/90 bg-primary/20 rounded-full backdrop-blur-sm border border-primary/30">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
          Marketplace Live
        </span>

        {/* Title */}
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight">
          Discover & Sell <span className="text-primary">Digital Excellence</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
          Explore a curated collection of premium digital products and freelance services built with innovation and crafted for impact.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="px-8 glow-button">
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 border-muted-foreground/30">
            <Link href="/freelance">Hire Talent</Link>
          </Button>
        </div>
      </div>

      {/* Optional: Floating Logos Marquee (if you want it here) */}
      {/* <div className="mt-20">
        <Logomarquee />
      </div> */}
    </section>
  );
}