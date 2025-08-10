'use client';

import React from 'react';

// --- SVG Icons (Optional: Replace with your branded icons) ---
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6" />
    <path d="M3 6l9 5 9-5" />
    <path d="M3 11l9 5 9-5" />
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-6" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

// --- Feature Section Component ---
const FeatureSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.FC;
  children: React.ReactNode;
}) => (
  <section className="mb-16 last:mb-0">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        <Icon />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </section>
);

// --- Feature Card ---
const FeatureCard = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="bg-card border border-border/60 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
  </div>
);

// --- Main Export ---
export default function IntelligentPOS() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Intelligent POS for Modern Businesses
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Power your retail, restaurant, or service business with a full-featured, cloud-based point-of-sale system built for speed, insight, and growth.
        </p>
      </div>

      {/* Sales */}
      <FeatureSection title="Sales & Checkout" icon={ShoppingCartIcon}>
        <FeatureCard title="Open & Edit Tickets">
          Create, save, and modify orders with ease. Perfect for split checks or delayed payments.
        </FeatureCard>
        <FeatureCard title="Multiple Payment Methods">
          Accept cash, card, mobile money, and Uscor Tokens in one seamless flow.
        </FeatureCard>
        <FeatureCard title="Discounts & Refunds">
          Apply item-level or receipt-wide discounts. Process full or partial refunds instantly.
        </FeatureCard>
        <FeatureCard title="Item Variants & Modifiers">
          Offer sizes, colors, or add-ons with simple modifiers and variant groups.
        </FeatureCard>
        <FeatureCard title="Receipts & History">
          Generate digital or printed receipts. View full transaction history with filters.
        </FeatureCard>
        <FeatureCard title="Work Offline">
          Keep selling even without internet. All data syncs automatically when connection resumes.
        </FeatureCard>
      </FeatureSection>

      {/* Inventory */}
      <FeatureSection title="Inventory Management" icon={PackageIcon}>
        <FeatureCard title="Stock Tracking">
          Real-time inventory sync across all sales channels and locations.
        </FeatureCard>
        <FeatureCard title="Low-Stock Alerts">
          Get notified when stock levels fall below your threshold.
        </FeatureCard>
        <FeatureCard title="Purchase & Transfer Orders">
          Create purchase orders from suppliers or transfer stock between stores.
        </FeatureCard>
        <FeatureCard title="Stock Adjustments">
          Record damages, losses, or manual inventory changes with audit logs.
        </FeatureCard>
        <FeatureCard title="Bulk Import/Export (CSV)">
          Add or update thousands of products via CSV upload or export for analysis.
        </FeatureCard>
        <FeatureCard title="Composite Items">
          Build combo meals or kits from multiple components (e.g., "Burger Meal").
        </FeatureCard>
      </FeatureSection>

      {/* Workers */}
      <FeatureSection title="Workers & Access Control" icon={UsersIcon}>
        <FeatureCard title="Clock In/Out & Shifts">
          Track employee hours, breaks, and shift performance.
        </FeatureCard>
        <FeatureCard title="Sales by Employee">
          See who’s selling what and reward top performers.
        </FeatureCard>
        <FeatureCard title="Role-Based Permissions">
          Control access: manager, cashier, admin, with custom permissions.
        </FeatureCard>
      </FeatureSection>

      {/* Analytics */}
      <FeatureSection title="Analytics & Reporting" icon={BarChartIcon}>
        <FeatureCard title="Sales Trends">
          View daily, weekly, monthly sales with visual charts.
        </FeatureCard>
        <FeatureCard title="Item Performance">
          Identify best-sellers and underperformers to optimize stock.
        </FeatureCard>
        <FeatureCard title="Tax Reports">
          Generate compliant tax reports for local and national requirements.
        </FeatureCard>
        <FeatureCard title="Shift & Worker Reports">
          Analyze productivity, sales per shift, and labor costs.
        </FeatureCard>
        <FeatureCard title="Exportable Dashboards">
          Export data to CSV or PDF for deeper analysis or accounting.
        </FeatureCard>
      </FeatureSection>

      {/* CRM & Loyalty */}
      <FeatureSection title="CRM & Loyalty" icon={ShieldIcon}>
        <FeatureCard title="Customer Profiles">
          Track purchase history, contact info, and preferences.
        </FeatureCard>
        <FeatureCard title="Notes & Preferences">
          Remember special requests (e.g., "no ice", "allergy to peanuts").
        </FeatureCard>
        <FeatureCard title="Loyalty Cards & Points">
          Reward repeat customers with points or tiered loyalty programs.
        </FeatureCard>
      </FeatureSection>

      {/* Multi-Store */}
      <FeatureSection title="Multi-Store Management" icon={ZapIcon}>
        <FeatureCard title="Central Dashboard">
          Manage all locations from one unified interface.
        </FeatureCard>
        <FeatureCard title="Sync Inventory & Sales">
          Keep stock and sales data consistent across branches.
        </FeatureCard>
        <FeatureCard title="Branch-Specific Workers">
          Assign employees to specific stores with role overrides.
        </FeatureCard>
      </FeatureSection>

      {/* Customer Display */}
      <FeatureSection title="Customer Display (CDS)" icon={MonitorIcon}>
        <FeatureCard title="Real-Time Order Display">
          Show order details to customers on a second screen during checkout.
        </FeatureCard>
        <FeatureCard title="Brand Messaging & Ads">
          Display promotions, thank-you messages, or social media links.
        </FeatureCard>
        <FeatureCard title="Builds Trust & Transparency">
          Customers see exactly what they’re buying — reducing disputes.
        </FeatureCard>
      </FeatureSection>
    </div>
  );
}