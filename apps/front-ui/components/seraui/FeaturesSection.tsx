'use client';

import Link from 'next/link';
import React, { ComponentPropsWithoutRef, FC, SVGProps } from 'react';

// --- Utility Function ---
const cn = (...inputs: (string | boolean | undefined | null)[]) =>
  inputs.filter(Boolean).join(' ');

// --- Arrow Icon ---
const ArrowRightIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.22 2.72a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 8.5H3.75a.75.75 0 0 1 0-1.5h8.19L8.22 3.78a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

// --- BentoGrid & BentoCard ---
interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

const BentoGrid: FC<BentoGridProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[20rem] sm:auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
// Define the icon type properly
type IconType = React.ComponentType<SVGProps<SVGSVGElement>>;

// --- Feature Interface ---
interface Feature {
  title: string;
  description: string;
  icon: IconType;
  hueA: number;
  hueB: number;
}


interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  title: string;
  description: string;
  icon: IconType;
  hueA: number;
  hueB: number;
}

const BentoCard: FC<BentoCardProps> = ({ title, description, icon: Icon, hueA, hueB, ...props }) => {
  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-lg transform-gpu transition-all duration-300"
      {...props}
    >
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: `linear-gradient(45deg, hsl(${hueA}, 60%, 40%), hsl(${hueB}, 75%, 65%))`,
        }}
      />

      <div className="relative z-10 p-6">
        <div
          className="h-12 w-12 mb-4 text-primary origin-left transform transition-transform duration-300 group-hover:scale-110"
          style={{ color: `hsl(${hueA}, 70%, 50%)` }}
        >
          <Icon aria-hidden="true" focusable="false" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className=" text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <Link href="/uscor-features">
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 transform translate-y-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 p-6">
          <span className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors">
            Learn more
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </span>
        </div>
      </Link>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/5 group-hover:to-black/8 transition-color-300" />
    </div>
  );
};

// --- SVG Icons (same as before) ---
const Zap = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
);

const CreditCard = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="6" width="20" height="14" rx="2"></rect>
    <path d="M2 10h20"></path>
  </svg>
);

const ShoppingCart = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const Users = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const Repeat = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m17 1 4 4-4 4"></path>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <path d="m7 23-4-4 4-4"></path>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
  </svg>
);

const Megaphone = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m3 11 18-5v12L3 17v-2h16L5 13v-2h14L3 9z"></path>
  </svg>
);

const UserCheck2 = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="m16 11 2 2 4-4"></path>
  </svg>
);

const Gift = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="8" width="18" height="8" rx="1"></rect>
    <path d="M12 8v-3"></path>
    <path d="M9 5h6"></path>
    <path d="M9 16v3"></path>
    <path d="M9 19h6"></path>
  </svg>
);

// --- Enhanced & Reordered Features ---
const features: Feature[] = [
  {
    title: 'Intelligent POS',
    icon: Zap,
    description: 'All-in-one point-of-sale system with real-time inventory, multi-payment support, and AI-driven sales insights. Designed for retail, food, and service businesses.',
    hueA: 260,
    hueB: 290
  },
  {
    title: 'Marketplace',
    icon: ShoppingCart,
    description: 'Buy & sell digital and physical goods with low commissions (4–10%). Built-in escrow and dispute resolution for secure transactions.',
    hueA: 340,
    hueB: 10
  },
  {
    title: 'Freelance Gigs',
    icon: CreditCard,
    description: 'Offer services and get paid instantly. Uscor handles contracts, milestones, and payouts — no middlemen, just results.',
    hueA: 100,
    hueB: 140
  },
  {
    title: 'Affiliate Program',
    icon: Users,
    description: 'Earn 2.5 uTn for every 15 verified users you refer. Scalable income with zero upfront cost.',
    hueA: 80,
    hueB: 120
  },
  {
    title: 'Repost & Re-own',
    icon: Repeat,
    description: 'Amplify your reach by reposting products or reacquiring them for resale. Earn a 0.2% bonus on every re-sold item.',
    hueA: 60,
    hueB: 90
  },
  {
    title: 'Advertising',
    icon: Megaphone,
    description: 'Generate passive income: 2.5 uTn per active ad. Monetize your audience without selling your soul.',
    hueA: 20,
    hueB: 40
  },
  {
    title: 'KYC & Security',
    icon: UserCheck2,
    description: 'Advanced identity verification to unlock premium features, higher limits, and trust badges.',
    hueA: 205,
    hueB: 245
  },
  {
    title: 'Bonuses & Rewards',
    icon: Gift,
    description: 'Accumulate bonus uTn through loyalty programs, referrals, and consistent platform engagement.',
    hueA: 290,
    hueB: 320
  }
];

// --- Main Export ---
export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Services That Power Your Success
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From intelligent POS to global freelancing, Uscor equips you with tools to grow, earn, and scale.
          </p>
        </div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}