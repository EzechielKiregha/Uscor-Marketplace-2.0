"use client";
import type React from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import AccordionLast from "./accordion-last";

const FaqPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-orange-500/8 dark:bg-orange-500/5 blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200 dark:border-orange-800/50 mb-6">
            Help Center
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-500">
              Questions
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about USCOR Marketplace,
            payments, shipping, and getting started.
          </p>
        </div>
      </section>

      <MaxWidthWrapper>
        <div className="mx-auto max-w-5xl mb-16">
          <AccordionLast />
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default FaqPage;
