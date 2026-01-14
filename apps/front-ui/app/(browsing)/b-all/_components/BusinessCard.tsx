// app/businesses/_components/BusinessCard.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Star,
  Gift,
  Users,
  ShieldCheck,
  MapPin,
  BriefcaseBusiness,
  ArrowRight
} from 'lucide-react';

interface BusinessCardProps {
  business: any;
  viewMode: 'grid' | 'list';
}

export default function BusinessCard({ business, viewMode }: BusinessCardProps) {
  // Determine business type icon and label
  const getBusinessTypeDetails = () => {
    switch (business.businessType) {
      case 'ARTISAN':
        return { icon: '🎨', label: 'Artisan & Handcrafted Goods' };
      case 'BOOKSTORE':
        return { icon: '📚', label: 'Bookstore & Stationery' };
      case 'ELECTRONICS':
        return { icon: '🔌', label: 'Electronics & Gadgets' };
      case 'HARDWARE':
        return { icon: '🔨', label: 'Hardware & Tools' };
      case 'GROCERY':
        return { icon: '🛒', label: 'Grocery & Convenience' };
      case 'CAFE':
        return { icon: '☕', label: 'Café & Coffee Shops' };
      case 'RESTAURANT':
        return { icon: '🍽️', label: 'Restaurant & Dining' };
      case 'RETAIL':
        return { icon: '🏬', label: 'Retail & General Stores' };
      case 'BAR':
        return { icon: '🍷', label: 'Bar & Pub' };
      case 'CLOTHING':
        return { icon: '👕', label: 'Clothing & Accessories' };
      default:
        return { icon: '🏢', label: 'Business' };
    }
  };

  const businessType = getBusinessTypeDetails();

  if (viewMode === 'grid') {
    return (
      <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card">
        <div className="h-40 bg-muted relative">
          {business.coverImage ? (
            <img
              src={business.coverImage}
              alt={`${business.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="absolute -bottom-6 left-4 w-12 h-12 border-4 border-background rounded-full overflow-hidden bg-card shadow-lg">
            {business.avatar ? (
              <img
                src={business.avatar}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-xl font-bold">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 pb-4 px-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg truncate">{business.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <span>{businessType.icon}</span>
                <span>{businessType.label}</span>
              </p>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <Star className="h-4 w-4" />
              </div>
              <p className="text-xs mt-1">4.7</p>
            </div>
          </div>

          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {business.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1">
            {business.loyaltyProgram && (
              <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="h-3 w-3" />
                Loyalty Program
              </span>
            )}

            {business.promotions && business.promotions.length > 0 && (
              <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full flex items-center gap-1">
                <Gift className="h-3 w-3" />
                Promotion
              </span>
            )}

            {business.isB2BEnabled && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                <BriefcaseBusiness className="h-3 w-3" />
                B2B Services
              </span>
            )}

            {business.kycStatus === 'VERIFIED' && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{business.address || 'Address not provided'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/business/${business.id}`}
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card flex flex-col md:flex-row">
      <div className="md:w-48 h-32 md:h-auto bg-muted relative">
        {business.coverImage ? (
          <img
            src={business.coverImage}
            alt={`${business.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="absolute -bottom-4 left-4 w-10 h-10 border-2 border-background rounded-full overflow-hidden bg-card shadow-lg">
          {business.avatar ? (
            <img
              src={business.avatar}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-xl font-bold">
              {business.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg">{business.name}</h3>
              <span className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                <span>{businessType.icon}</span>
                <span>{businessType.label}</span>
              </span>
            </div>

            {business.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {business.description}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-1">
              {business.loyaltyProgram && (
                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Loyalty Program
                </span>
              )}

              {business.promotions && business.promotions.length > 0 && (
                <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Promotion
                </span>
              )}

              {business.isB2BEnabled && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                  <BriefcaseBusiness className="h-3 w-3" />
                  B2B Services
                </span>
              )}

              {business.kycStatus === 'VERIFIED' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-2">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="font-medium">4.7</span>
              <span className="text-muted-foreground">(124)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/business/${business.id}`}
            >
              View Profile <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{business.address || 'Address not provided'}</span>
        </div>
      </div>
    </div>
  );
}