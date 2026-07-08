"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    type BusinessTypeConfig,
    getBusinessTypeConfig,
} from "@/config/business-types";
import { cn } from "@/lib/utils";
import {
    Award,
    BookOpen,
    Calendar,
    Package,
    Shield,
    Tag
} from "lucide-react";

interface TypeDashboardWidgetsProps {
  businessType: string;
  products: any[];
}

/**
 * Renders business-type-specific insight widgets on the dashboard.
 * Uses existing product data (no extra queries) to show actionable info.
 */
export default function TypeDashboardWidgets({
  businessType,
  products,
}: TypeDashboardWidgetsProps) {
  const config = getBusinessTypeConfig(businessType);
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {config.features.warrantyTracking && (
        <WarrantyWidget products={products} config={config} />
      )}
      {config.features.serialTracking && (
        <SerialTrackingWidget products={products} config={config} />
      )}
      {config.features.expiryTracking && (
        <ExpiryWidget products={products} config={config} />
      )}
      {config.features.bulkPricing && (
        <BulkPricingWidget products={products} config={config} />
      )}
      {config.features.isbn && (
        <ISBNWidget products={products} config={config} />
      )}
      <TopBrandsWidget products={products} config={config} />
    </div>
  );
}

// ─── Individual Widgets ─────────────────────────────────────────────────────

function WarrantyWidget({ products, config }: { products: any[]; config: BusinessTypeConfig }) {
  const withWarranty = products.filter((p) => p.warrantyMonths && p.warrantyMonths > 0);
  const avgWarranty =
    withWarranty.length > 0
      ? Math.round(withWarranty.reduce((sum, p) => sum + p.warrantyMonths, 0) / withWarranty.length)
      : 0;

  return (
    <Card className={cn("border", config.color.border)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Warranty Coverage</CardTitle>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{withWarranty.length}</div>
        <p className="text-xs text-muted-foreground">
          {withWarranty.length > 0
            ? `products with warranty (avg ${avgWarranty}mo)`
            : "No warranty data — add warranty info to products"}
        </p>
      </CardContent>
    </Card>
  );
}

function SerialTrackingWidget({ products, config }: { products: any[]; config: BusinessTypeConfig }) {
  const withSerial = products.filter((p) => p.serialNumber);
  const withIMEI = products.filter((p) => p.imei);

  return (
    <Card className={cn("border", config.color.border)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Serial Tracking</CardTitle>
        <Tag className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{withSerial.length}</div>
        <p className="text-xs text-muted-foreground">
          serialized products{withIMEI.length > 0 ? ` · ${withIMEI.length} with IMEI` : ""}
        </p>
      </CardContent>
    </Card>
  );
}

function ExpiryWidget({ products, config }: { products: any[]; config: BusinessTypeConfig }) {
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const withExpiry = products.filter((p) => {
    const date = p.variants?.expiryDate;
    return date && !Number.isNaN(new Date(date).getTime());
  });
  const expiringSoon = withExpiry.filter((p) => {
    const d = new Date(p.variants.expiryDate);
    return d <= sevenDays && d >= now;
  });
  const expired = withExpiry.filter((p) => new Date(p.variants.expiryDate) < now);

  return (
    <Card className={cn("border", config.color.border)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Expiry Tracking</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {expiringSoon.length > 0 ? (
            <span className="text-amber-600">{expiringSoon.length}</span>
          ) : (
            <span className="text-green-600">0</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          expiring within 7 days
          {expired.length > 0 && (
            <span className="text-destructive"> · {expired.length} expired</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

function BulkPricingWidget({ products, config }: { products: any[]; config: BusinessTypeConfig }) {
  const withBulk = products.filter((p) => p.variants?.bulkPrice || p.variants?.moq);

  return (
    <Card className={cn("border", config.color.border)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Bulk Pricing</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{withBulk.length}</div>
        <p className="text-xs text-muted-foreground">
          {withBulk.length > 0
            ? "products with bulk/wholesale pricing"
            : "No bulk pricing set — add MOQ and bulk prices"}
        </p>
      </CardContent>
    </Card>
  );
}

function ISBNWidget({ products, config }: { products: any[]; config: BusinessTypeConfig }) {
  const withISBN = products.filter((p) => p.variants?.isbn);
  const withAuthor = products.filter((p) => p.variants?.author);

  return (
    <Card className={cn("border", config.color.border)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Catalog Coverage</CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{withISBN.length}</div>
        <p className="text-xs text-muted-foreground">
          books with ISBN · {withAuthor.length} with author info
        </p>
      </CardContent>
    </Card>
  );
}

function TopBrandsWidget({ products, config }: { products: any[]; config: BusinessTypeConfig }) {
  const brandCounts: Record<string, number> = {};
  for (const p of products) {
    const brand = p.brand || p.variants?.brand;
    if (brand) brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  }
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topBrands.length === 0) return null;

  return (
    <Card className={cn("border", config.color.border)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Brands</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {topBrands.map(([brand, count]) => (
            <div key={brand} className="flex items-center justify-between text-sm">
              <span className="truncate">{brand}</span>
              <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", config.color.badge)}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
