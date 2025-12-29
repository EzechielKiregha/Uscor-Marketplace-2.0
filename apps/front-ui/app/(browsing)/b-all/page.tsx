'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  GET_BUSINESSES,
  GET_BUSINESS_TYPES,
  ON_BUSINESS_ADDED
} from '@/graphql/business-listing.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Filter,
  LayoutGrid,
  List,
  Star,
  Gift,
  Users,
  ShieldCheck,
  Loader2,
  MapPin,
  BriefcaseBusiness,
  ArrowRight
} from 'lucide-react';
import { useMe } from '@/lib/useMe';
import Loader from '@/components/seraui/Loader';
import BusinessCard from './_components/BusinessCard';
import { URLSearchParams } from 'node:url';

interface BusinessListingPageProps {
  sp: {
    loyalty?: string;
    promotions?: string;
    b2b?: string;
    verified?: string;
    businessType?: string;
    sort?: string;
  } | URLSearchParams;
}

export default function BusinessListingPage({ sp }: BusinessListingPageProps) {

  // const { user, loading: authLoading } = useMe();
  // Unwrap Next.js `sp` proxy using React.use() per lint advice
  const _searchParams = (React as any).use ? (React as any).use(sp) : sp;
  const [filters, setFilters] = useState({
    search: '',
    businessType: _searchParams.businessType || '',
    hasLoyalty: _searchParams.loyalty === 'true',
    hasPromotions: _searchParams.promotions === 'true',
    isB2BEnabled: _searchParams.b2b === 'true',
    isVerified: _searchParams.verified === 'true',
    sort: _searchParams.sort || 'relevance'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const {
    data: businessesData,
    loading: businessesLoading,
    error: businessesError,
    refetch
  } = useQuery(GET_BUSINESSES, {
    variables: {
      search: filters.search || undefined,
      businessType: filters.businessType || undefined,
      hasLoyalty: filters.hasLoyalty,
      hasPromotions: filters.hasPromotions,
      isB2BEnabled: filters.isB2BEnabled,
      isVerified: filters.isVerified,
      sort: filters.sort,
      page,
      limit: 12
    }
  });

  const {
    data: businessTypesData,
    loading: businessTypesLoading
  } = useQuery(GET_BUSINESS_TYPES);

  // Handle real-time business additions
  useSubscription(ON_BUSINESS_ADDED, {
    onData: ({ data }) => {
      refetch();
    }
  });

  const businesses = businessesData?.businesses?.items || [];
  const totalBusinesses = businessesData?.businesses?.total || 0;
  const totalPages = Math.ceil(totalBusinesses / 12);

  const businessTypes = businessTypesData?.businessTypes || [
    { id: 'ARTISAN', name: 'Artisan & Handcrafted Goods', icon: '🎨' },
    { id: 'BOOKSTORE', name: 'Bookstore & Stationery', icon: '📚' },
    { id: 'ELECTRONICS', name: 'Electronics & Gadgets', icon: '🔌' },
    { id: 'HARDWARE', name: 'Hardware & Tools', icon: '🔨' },
    { id: 'GROCERY', name: 'Grocery & Convenience', icon: '🛒' },
    { id: 'CAFE', name: 'Café & Coffee Shops', icon: '☕' },
    { id: 'RESTAURANT', name: 'Restaurant & Dining', icon: '🍽️' },
    { id: 'RETAIL', name: 'Retail & General Stores', icon: '🏬' },
    { id: 'BAR', name: 'Bar & Pub', icon: '🍷' },
    { id: 'CLOTHING', name: 'Clothing & Accessories', icon: '👕' }
  ];

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      businessType: '',
      hasLoyalty: false,
      hasPromotions: false,
      isB2BEnabled: false,
      isVerified: false,
      sort: 'relevance'
    });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    // Apply filters from URL params on initial load
    setFilters({
      search: '',
      businessType: _searchParams.businessType || '',
      hasLoyalty: _searchParams.loyalty === 'true',
      hasPromotions: _searchParams.promotions === 'true',
      isB2BEnabled: _searchParams.b2b === 'true',
      isVerified: _searchParams.verified === 'true',
      sort: _searchParams.sort || 'relevance'
    });
  }, [_searchParams]);

  if (businessesLoading || businessTypesLoading) return <Loader loading={true} />;
  if (businessesError) return <div>Error loading businesses: {businessesError.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Directory</h1>
        <p className="text-muted-foreground">
          Discover local businesses with special offers and features
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
        <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search businesses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.businessType}
              onChange={(e) => handleFilterChange('businessType', e.target.value)}
              className="w-full sm:w-48 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Business Types</option>
              {businessTypes.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>

            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-wrap gap-2">
          <Button
            variant={filters.hasLoyalty ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('hasLoyalty', !filters.hasLoyalty)}
            className="flex items-center gap-1"
          >
            <Star className="h-4 w-4" />
            Loyalty Programs
          </Button>

          <Button
            variant={filters.hasPromotions ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('hasPromotions', !filters.hasPromotions)}
            className="flex items-center gap-1"
          >
            <Gift className="h-4 w-4" />
            Promotions
          </Button>

          <Button
            variant={filters.isB2BEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('isB2BEnabled', !filters.isB2BEnabled)}
            className="flex items-center gap-1"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            B2B Services
          </Button>

          <Button
            variant={filters.isVerified ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('isVerified', !filters.isVerified)}
            className="flex items-center gap-1"
          >
            <ShieldCheck className="h-4 w-4" />
            Verified
          </Button>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
            <option value="nearby">Nearby First</option>
          </select>

          {(filters.hasLoyalty || filters.hasPromotions || filters.isB2BEnabled || filters.isVerified) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-muted-foreground">
          {totalBusinesses} {totalBusinesses === 1 ? 'business' : 'businesses'} found
        </p>
        <p className="text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      </div>

      {/* Business Grid/List */}
      {businesses.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No businesses found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter criteria
          </p>

          <Button
            variant="outline"
            onClick={handleClearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {businesses.map((business: any) => (
            <BusinessCard
              key={business.id}
              business={business}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalBusinesses > 12 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>

          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Featured Business Types */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Popular Business Categories</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {businessTypes.map((type: any) => (
            <Button
              key={type.id}
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto hover:bg-muted/50"
              onClick={() => handleFilterChange('businessType', type.id)}
            >
              <span className="text-3xl mb-2">{type.icon}</span>
              <span className="text-sm font-medium text-center">{type.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Businesses Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Businesses</h2>
          <Button variant="link">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* In a real app, this would show featured businesses */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="h-40 bg-muted" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  🎨
                </div>
                <h3 className="font-medium">Kigali Artisans Collective</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                Handcrafted woodwork, pottery, and traditional Rwandan crafts
              </p>
              <div className="flex items-center justify-between">
                <div className="flex">
                  <Star className="h-4 w-4 text-warning fill-warning mr-1" />
                  <span>4.8 (124)</span>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="h-40 bg-muted" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  ☕
                </div>
                <h3 className="font-medium">Café Kigali</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                Premium Rwandan coffee, pastries, and cozy workspace
              </p>
              <div className="flex items-center justify-between">
                <div className="flex">
                  <Star className="h-4 w-4 text-warning fill-warning mr-1" />
                  <span>4.7 (218)</span>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="h-40 bg-muted" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  🔨
                </div>
                <h3 className="font-medium">Hardware Plus</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                Tools, building materials, and expert advice for your projects
              </p>
              <div className="flex items-center justify-between">
                <div className="flex">
                  <Star className="h-4 w-4 text-warning fill-warning mr-1" />
                  <span>4.9 (86)</span>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}