'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  GET_MARKETPLACE_DATA,
  ON_PRODUCT_ADDED,
  ON_SERVICE_ADDED
} from '@/graphql/marketplace.gql';
import { GET_PRODUCTS } from '@/graphql/product.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Star,
  Gift,
  Loader2,
  X,
  MapPin,
  CreditCard,
  ShoppingCart,
  BriefcaseBusiness,
  ArrowRight
} from 'lucide-react';
import { useMe } from '@/lib/useMe';
import Loader from '@/components/seraui/Loader';
import ProductCard from './_components/ProductCard';
import ServiceCard from './_components/ServiceCard';
import SearchModal from './_components/SearchModal';
import { useSearchParams } from 'next/navigation';
import { URLSearchParams } from 'node:url';

interface MarketplacePageProps {
  sp: {
    category?: string;
    businessType?: string;
    hasPromotion?: string;
    featured?: string;
    sort?: string;
  } | URLSearchParams;
}

export default function MarketplacePage({ sp }: MarketplacePageProps) {
  // const { user, loading: authLoading } = useMe();
  // Unwrap Next.js `sp` proxy using React.use() per lint advice
  const _searchParams = (React as any).use ? (React as any).use(sp) : sp;
  const search_params = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const tab = search_params.get('tab');
  const [activeTab, setActiveTab] = useState<'products' | 'services'>(tab as 'products' | 'services' || 'products');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: _searchParams?.category || '',
    businessType: _searchParams?.businessType || '',
    hasPromotion: _searchParams?.hasPromotion === true,
    featured: _searchParams?.featured === true,
    minPrice: '',
    maxPrice: '',
    sort: _searchParams?.sort || 'relevance'
  });
  const [page, setPage] = useState(1);

  // Determine whether any filters are active (treat default sort='relevance' and false toggles as no-filter)
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.category ||
    filters.businessType ||
    filters.hasPromotion === true ||
    filters.featured === true ||
    filters.minPrice ||
    filters.maxPrice ||
    (filters.sort && filters.sort !== 'relevance')
  );

  // Use GET_PRODUCTS for initial (no-filter) product load; skip when filters active or user on services tab
  const {
    data: productsAllData,
    loading: productsAllLoading,
    refetch: refetchProducts
  } = useQuery(GET_PRODUCTS, {
    skip: !(activeTab === 'products' && !hasActiveFilters)
  });

  // Use marketplace query when filters are active OR when on services tab
  const {
    data,
    loading: marketplaceLoading,
    error: marketplaceError,
    refetch: refetchMarketplace
  } = useQuery(GET_MARKETPLACE_DATA, {
    variables: {
      search: filters.search || undefined,
      category: filters.category || undefined,
      businessType: filters.businessType || undefined,
      hasPromotion: filters.hasPromotion,
      isFeatured: filters.featured,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      sort: filters.sort,
      page,
      limit: 12
    },
    skip: activeTab === 'products' && !hasActiveFilters
  });

  // Handle real-time updates; refetch the active query
  useSubscription(ON_PRODUCT_ADDED, {
    variables: { businessId: null },
    onData: ({ data }) => {
      if (activeTab === 'products' && !hasActiveFilters) {
        refetchProducts?.();
      } else {
        refetchMarketplace?.();
      }
    }
  });

  useSubscription(ON_SERVICE_ADDED, {
    variables: { businessId: null },
    onData: ({ data }) => {
      if (activeTab === 'products' && !hasActiveFilters) {
        refetchProducts?.();
      } else {
        refetchMarketplace?.();
      }
    }
  });

  // Choose data source: GET_PRODUCTS when no filters on products tab, otherwise use marketplace query
  const products = (activeTab === 'products' && !hasActiveFilters)
    ? (productsAllData?.products || [])
    : (data?.marketplaceProducts?.items || []);
  const services = data?.marketplaceServices?.items || [];
  const totalProducts = (activeTab === 'products' && !hasActiveFilters)
    ? (productsAllData?.products?.length || 0)
    : (data?.marketplaceProducts?.total || 0);
  const totalServices = data?.marketplaceServices?.total || 0;
  const pageSize = 12;
  const totalPages = activeTab === 'products'
    ? Math.max(1, Math.ceil(totalProducts / pageSize))
    : Math.max(1, Math.ceil(totalServices / pageSize));
  const businessTypes = data?.businessTypes || [
    { id: 'ARTISAN', name: 'Artisan & Handcrafted Goods', description: 'Craftsmen, wood workers, local artisans creating handmade products' },
    { id: 'BOOKSTORE', name: 'Bookstore & Stationery', description: 'Book sellers, stationery shops, and publishing businesses' },
    { id: 'ELECTRONICS', name: 'Electronics & Gadgets', description: 'Electronics retailers, gadget stores, and tech repair services' },
    { id: 'HARDWARE', name: 'Hardware & Tools', description: 'Hardware stores, tool suppliers, and building material retailers' },
    { id: 'GROCERY', name: 'Grocery & Convenience', description: 'Grocery stores, supermarkets, and convenience shops' },
    { id: 'CAFE', name: 'Café & Coffee Shops', description: 'Coffee shops, cafés, and beverage-focused businesses' },
    { id: 'RESTAURANT', name: 'Restaurant & Dining', description: 'Full-service restaurants, eateries, and dining establishments' },
    { id: 'RETAIL', name: 'Retail & General Stores', description: 'General retail stores, department stores, and variety shops' },
    { id: 'BAR', name: 'Bar & Pub', description: 'Bars, pubs, and establishments focused on alcoholic beverages' },
    { id: 'CLOTHING', name: 'Clothing & Accessories', description: 'Clothing retailers, fashion boutiques, and accessory stores' }
  ];
  const productCategories = data?.productCategories || [
    { id: 'FOOD', name: 'Food & Beverages', description: 'Fresh produce, packaged foods, and beverages' },
    { id: 'CLOTHING', name: 'Clothing & Accessories', description: 'Apparel, footwear, and fashion accessories' },
    { id: 'ELECTRONICS', name: 'Electronics', description: 'Phones, computers, and electronic devices' },
    { id: 'HOME', name: 'Home & Kitchen', description: 'Furniture, kitchenware, and home essentials' },
    { id: 'BOOKS', name: 'Books & Stationery', description: 'Books, notebooks, and office supplies' },
    { id: 'TOOLS', name: 'Tools & Hardware', description: 'Hand tools, power tools, and building materials' },
    { id: 'CRAFTS', name: 'Craft Supplies', description: 'Materials for handmade crafts and DIY projects' }
  ];

  // console.log('products: ', products);

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
      category: '',
      businessType: '',
      hasPromotion: false,
      featured: false,
      minPrice: '',
      maxPrice: '',
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
      category: _searchParams.category || '',
      businessType: _searchParams.businessType || '',
      hasPromotion: _searchParams.hasPromotion === 'true',
      featured: _searchParams.featured === 'true',
      minPrice: '',
      maxPrice: '',
      sort: _searchParams.sort || 'relevance'
    });
  }, [_searchParams]);

  if (marketplaceLoading) return <Loader loading={true} />;
  if (marketplaceError) return <div>Error loading marketplace: {marketplaceError.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover products and services from local businesses
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
        <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search products and services..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
              onClick={() => setShowSearchModal(true)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'products' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('products')}
              className="flex items-center gap-1"
            >
              <ShoppingCart className="h-4 w-4" />
              Products
            </Button>

            <Button
              variant={activeTab === 'services' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('services')}
              className="flex items-center gap-1"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Services
            </Button>

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
          <select
            value={filters.businessType}
            onChange={(e) => handleFilterChange('businessType', e.target.value)}
            className="w-full sm:w-48 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Business Types</option>
            {businessTypes.map((type: any) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          {activeTab === 'products' && (
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full sm:w-48 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Product Categories</option>
              {productCategories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === 'services' && (
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full sm:w-48 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Service Categories</option>
              <option value="DESIGN">Design & Creative</option>
              <option value="DEV">Development</option>
              <option value="PLUMBER">Plumbing</option>
              <option value="ELECTRICIAN">Electrical</option>
              <option value="CARPENTER">Carpentry</option>
              <option value="MECHANIC">Mechanics</option>
              <option value="TUTOR">Tutoring</option>
            </select>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm">Price:</span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-20"
            />
          </div>

          <Button
            variant={filters.hasPromotion ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('hasPromotion', !filters.hasPromotion)}
            className="flex items-center gap-1"
          >
            <Gift className="h-4 w-4" />
            On Sale
          </Button>

          <Button
            variant={filters.featured ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('featured', !filters.featured)}
            className="flex items-center gap-1"
          >
            <Star className="h-4 w-4" />
            Featured
          </Button>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>

          {(filters.category || filters.businessType || filters.hasPromotion || filters.featured || filters.minPrice || filters.maxPrice) && (
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
          {activeTab === 'products'
            ? `${totalProducts} ${totalProducts === 1 ? 'product' : 'products'} found`
            : `${totalServices} ${totalServices === 1 ? 'service' : 'services'} found`}
        </p>
        <p className="text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      </div>

      {/* Products/Services Grid/List */}
      {activeTab === 'products' ? (
        products.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No products found</h3>
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
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        )
      ) : (
        services.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BriefcaseBusiness className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No services found</h3>
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
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {services.map((service: any) => (
              <ServiceCard
                key={service.id}
                service={service}
                viewMode={viewMode}
              />
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {(products.length > 0 || services.length > 0) && (
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

      {/* Business Type Categories */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Shop by Business Type</h2>
          <Button variant="link" onClick={() => window.location.href = '/businesses'}>
            View All Businesses <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {businessTypes.map((type: any) => (
            <Button
              key={type.id}
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto hover:bg-muted/50"
              onClick={() => handleFilterChange('businessType', type.id)}
            >
              <BusinessTypeIcon businessType={type.id} />
              <span className="text-sm font-medium text-center mt-2">{type.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Products/Services */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured {activeTab === 'products' ? 'Products' : 'Services'}</h2>
          <Button variant="link">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTab === 'products' ? (
            <>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      🎨
                    </div>
                    <h3 className="font-medium">Handcrafted Wooden Table</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    Beautifully crafted from local Rwandan wood, perfect for your dining room
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span>4.8 (42)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$149.99</p>
                      <p className="text-xs text-warning">20% off</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      ☕
                    </div>
                    <h3 className="font-medium">Premium Rwandan Coffee</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    Freshly roasted beans from the hills of Rwanda, medium roast
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span>4.7 (128)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$12.99</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      📚
                    </div>
                    <h3 className="font-medium">Handmade Notebooks</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    Eco-friendly notebooks made from recycled paper and local materials
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span>4.9 (76)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$8.99</p>
                      <p className="text-xs text-warning">3 for $20</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      🔨
                    </div>
                    <h3 className="font-medium">Home Repair Service</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    Professional home repairs including plumbing, electrical, and carpentry
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span>4.8 (42)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$50/hr</p>
                      <p className="text-xs">Available today</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      📱
                    </div>
                    <h3 className="font-medium">Mobile App Development</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    Custom mobile app development for iOS and Android platforms
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span>4.7 (128)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$75/hr</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      🧑‍🏫
                    </div>
                    <h3 className="font-medium">Math Tutoring</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    One-on-one math tutoring for students of all ages and levels
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span>4.9 (76)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$25/hr</p>
                      <p className="text-xs">First lesson free</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSearch={(query) => {
            handleFilterChange('search', query);
            setShowSearchModal(false);
          }}
        />
      )}
    </div>
  );
}

// Business Type Icon Component
interface BusinessTypeIconProps {
  businessType: string;
}

function BusinessTypeIcon({ businessType }: BusinessTypeIconProps) {
  switch (businessType) {
    case 'ARTISAN':
      return <span className="text-3xl">🎨</span>;
    case 'BOOKSTORE':
      return <span className="text-3xl">📚</span>;
    case 'ELECTRONICS':
      return <span className="text-3xl">🔌</span>;
    case 'HARDWARE':
      return <span className="text-3xl">🔨</span>;
    case 'GROCERY':
      return <span className="text-3xl">🛒</span>;
    case 'CAFE':
      return <span className="text-3xl">☕</span>;
    case 'RESTAURANT':
      return <span className="text-3xl">🍽️</span>;
    case 'RETAIL':
      return <span className="text-3xl">🏬</span>;
    case 'BAR':
      return <span className="text-3xl">🍷</span>;
    case 'CLOTHING':
      return <span className="text-3xl">👕</span>;
    default:
      return <span className="text-3xl">🏢</span>;
  }
}