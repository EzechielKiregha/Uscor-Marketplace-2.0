'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Feature = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
};

const features: Feature[] = [
  {
    title: 'B2B Marketplace & E‑commerce',
    description:
      'Sell to businesses and consumers in one place. Custom catalogs, negotiated pricing, purchase orders, secure escrow, and global tax/currency support.',
    imageSrc: '/nav/businessHandshake.jpg', // existing asset
    imageAlt: 'Marketplace and e‑commerce showcase',
    href: '/uscor-features',
  },
  {
    title: 'Multi‑Store Management',
    description:
      'Run multiple stores from a single dashboard. Shared inventory, localized catalogs and pricing, role-based access, and unified reporting.',
    imageSrc: '/nav/multi-stores.jpg', // existing asset
    imageAlt: 'Multi‑store management dashboard',
    href: '/uscor-features',
  },
  {
    title: 'Intelligent POS',
    description:
      'Fast in‑store checkout synced with your online catalog. Real‑time inventory, offline mode, multi‑payment support, and AI-powered sales insights.',
    imageSrc: '/nav/pos.jpg', // existing asset
    imageAlt: 'Point of sale experience',
    href: '/uscor-features',
  },
  {
    title: 'Freelance Marketplace',
    description:
      'Hire vetted professionals or sell services with milestones, contracts, escrow, and instant payouts powered by Uscor.',
    imageSrc: '/nav/freelance.jpg', // existing asset
    imageAlt: 'Freelance marketplace and gigs',
    href: '/uscor-features',
  },
  {
    title: 'Security & Fraud Prevention',
    description:
      'End‑to‑end encryption, device checks, rate limiting, and anomaly detection to keep accounts and transactions safe.',
    imageSrc: '/nav/security.jpg', // existing asset
    imageAlt: 'Secure technology background',
    href: '/uscor-features',
  },
  {
    title: 'KYC & Compliance',
    description:
      'Verify identities to unlock higher limits and trust badges, with automated checks to meet regional regulations.',
    imageSrc: '/nav/kyc.png', // existing asset
    imageAlt: 'Compliance and verification',
    href: '/uscor-features',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Built for Modern Commerce
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From B2B sales to multi-location operations and in‑store checkout—grow every channel with one platform.
          </p>
        </div>

        {/* Features list - alternating image/text on desktop; image above text on mobile */}
        <div className="space-y-16">
          {features.map((feature, idx) => {
            const imageOnRight = idx % 2 === 0; // first: image right; second: image left; etc.

            return (
              <article
                key={feature.title}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center"
              >
                {/* Text block */}
                <div
                  className={
                    imageOnRight
                      ? 'order-2 md:order-1'
                      : 'order-2 md:order-2'
                  }
                >
                  <h3 className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.href && (
                    <div className="mt-6">
                      <Link
                        href={feature.href}
                        className="inline-flex items-center text-primary hover:text-accent transition-colors text-sm font-medium"
                      >
                        Learn more
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          className="ml-2 h-4 w-4"
                          fill="currentColor"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.22 2.72a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 8.5H3.75a.75.75 0 0 1 0-1.5h8.19L8.22 3.78a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Image block: mobile above text; desktop alternates left/right */}
                <div
                  className={
                    imageOnRight
                      ? 'order-1 md:order-2'
                      : 'order-1 md:order-1'
                  }
                >
                  <div className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      width={1200}
                      height={800}
                      className="h-64 sm:h-72 md:h-80 w-full object-cover"
                      priority={idx === 0}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}