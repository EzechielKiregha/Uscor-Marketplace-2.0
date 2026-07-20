"use client";

import { useQuery, useSubscription } from "@apollo/client";
import {
    BriefcaseBusiness,
    Filter,
    Gift,
    Grid2x2,
    Grid3x3,
    List,
    Search,
    ShoppingCart,
    SlidersHorizontal,
    Square,
    Star,
    X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import MotionPage from "@/components/MotionPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUSINESS_TYPE_LIST } from "@/config/business-types";
import {
    GET_MARKETPLACE_DATA,
    ON_PRODUCT_ADDED,
    ON_SERVICE_ADDED,
} from "@/graphql/marketplace.gql";
import { GET_PRODUCTS } from "@/graphql/product.gql";
import BusinessTypeShowcase from "./_components/BusinessTypeShowcase";
import EnhancedPagination from "./_components/EnhancedPagination";
import FeaturedProductsCarousel from "./_components/FeaturedProductsCarousel";
import FeaturedStoresSection from "./_components/FeaturedStoresSection";
import HorizontalCategoryScroll from "./_components/HorizontalCategoryScroll";
import ProductCardSkeleton from "./_components/ProductCardSkeleton";
import SearchModal from "./_components/SearchModal";
import ServiceCard from "./_components/ServiceCard";
import TypedProductCard from "./_components/TypedProductCard";

export default function MarketplacePage() {
    const router = useRouter()
  const search_params = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "small" | "medium" | "large">("medium");
  const tab = search_params.get("tab");
  const [activeTab, setActiveTab] = useState<"products" | "services">(
    (tab as "products" | "services") || "products",
  );
  const idFromSearch = search_params.get("idFromSearch");
  const [prodID, setProdID] = useState<string|undefined|null>(idFromSearch)
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: search_params.get("category") || "",
    businessType: search_params.get("businessType") || "",
    hasPromotion: !!search_params.get("hasPromotion"),
    featured: !!search_params.get("featured"),
    minPrice: "",
    maxPrice: "",
    sort: search_params.get("sort") || "relevance",
  });
  const [page, setPage] = useState(1);

  // Determine whether any filters are active
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.category ||
    filters.businessType ||
    filters.hasPromotion === true ||
    filters.featured === true ||
    filters.minPrice ||
    filters.maxPrice ||
    (filters.sort && filters.sort !== "relevance"),
  );

  // Use GET_PRODUCTS for initial (no-filter) product load
  const {
    data: productsAllData,
    loading: productsAllLoading,
    refetch: refetchProducts,
  } = useQuery(GET_PRODUCTS, {
    skip: !(activeTab === "products" && !hasActiveFilters),
  });

  // Use marketplace query when filters are active OR on services tab
  const {
    data,
    loading: marketplaceLoading,
    error: marketplaceError,
    refetch: refetchMarketplace,
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
      limit: 12,
    },
    skip: activeTab === "products" && !hasActiveFilters,
  });

  // Real-time updates
  useSubscription(ON_PRODUCT_ADDED, {
    variables: { businessId: null },
    onData: () => {
      if (activeTab === "products" && !hasActiveFilters) {
        refetchProducts?.();
      } else {
        refetchMarketplace?.();
      }
    },
  });

  useSubscription(ON_SERVICE_ADDED, {
    variables: { businessId: null },
    onData: () => {
      if (activeTab === "products" && !hasActiveFilters) {
        refetchProducts?.();
      } else {
        refetchMarketplace?.();
      }
    },
  });

  // Data sources
  const products =
    activeTab === "products" && !hasActiveFilters
      ? productsAllData?.products || []
      : data?.marketplaceProducts?.items || [];
  const services = data?.marketplaceServices?.items || [];
  const totalProducts =
    activeTab === "products" && !hasActiveFilters
      ? productsAllData?.products?.length || 0
      : data?.marketplaceProducts?.total || 0;
  const totalServices = data?.marketplaceServices?.total || 0;
  const pageSize = 12;
  const totalPages =
    activeTab === "products"
      ? Math.max(1, Math.ceil(totalProducts / pageSize))
      : Math.max(1, Math.ceil(totalServices / pageSize));

  const businessTypes = BUSINESS_TYPE_LIST.map((bt) => ({
    id: bt.key,
    name: bt.label,
    description: bt.description,
  }));
  const productCategories = data?.productCategories || [];

  // Featured products (from all products when unfiltered)
  const featuredProducts = useMemo(() => {
    if (hasActiveFilters || activeTab !== "products") return [];
    return products.filter((p: any) => p.featured).slice(0, 12);
  }, [products, hasActiveFilters, activeTab]);

  // Group products by business type for showcase sections
  const productsByType = useMemo(() => {
    if (hasActiveFilters || activeTab !== "products") return {};
    const grouped: Record<string, any[]> = {};
    for (const p of products) {
      const bt = p.business?.businessType;
      if (!bt) continue;
      if (!grouped[bt]) grouped[bt] = [];
      grouped[bt].push(p);
    }
    return grouped;
  }, [products, hasActiveFilters, activeTab]);

  const showcaseTypes = useMemo(() => {
    return Object.entries(productsByType)
      .filter(([, items]) => items.length > 0)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([type]) => type);
  }, [productsByType]);

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      businessType: "",
      hasPromotion: false,
      featured: false,
      minPrice: "",
      maxPrice: "",
      sort: "relevance",
    });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getGridClasses = (mode: typeof viewMode) => {
    switch (mode) {
      case "list":
        return "space-y-3";
      case "small":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3";
      case "medium":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5";
      case "large":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5";
    }
  };

  const getProductViewMode = (mode: typeof viewMode): "grid" | "list" => {
    return mode === "list" ? "list" : "grid";
  };

  useEffect(() => {
    setFilters({
      search: "",
      category: search_params.get("category") || "",
      businessType: search_params.get("businessType") || "",
      hasPromotion: search_params.get("hasPromotion") === "true",
      featured: search_params.get("featured") === "true",
      minPrice: "",
      maxPrice: "",
      sort: search_params.get("sort") || "relevance",
    });
  }, [search_params]);

  useEffect(()=>{
    if(idFromSearch){
        setProdID(idFromSearch)
        router.replace("/marketplace")
    }
  }, [idFromSearch, router])

  console.log(prodID)

  const isLoading = activeTab === "products" && !hasActiveFilters
    ? productsAllLoading
    : marketplaceLoading;

  if (marketplaceError) {
    return <div>Error loading marketplace: {marketplaceError.message}</div>;
  }

  return (
    <MotionPage className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover products and services from local businesses
        </p>
      </div>

      {/* Horizontal Category Scroll */}
      <div className="mb-6">
        <HorizontalCategoryScroll
          selected={filters.businessType}
          onSelect={(bt) => handleFilterChange("businessType", bt)}
        />
      </div>

      {/* Search + Filter Sticky Controls */}
      <div className="sticky top-2 z-40 mb-6">
        <div className="bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 border border-border hover:border-primary hover:bg-primary/5 rounded-2xl shadow-lg overflow-hidden">
          {/* TOP TOOLBAR */}
          <div className="p-3 sm:p-4 flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-50">
              <Input
                type="text"
                placeholder="Search products and services..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 h-11 rounded-xl bg-background"
                onClick={() => setShowSearchModal(true)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Toggle Filters */}
            <Button
              variant={showFilters ? "default" : "outline"}
              className="h-11 rounded-xl shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <X className="h-4 w-4 mr-2" />
              ) : (
                <SlidersHorizontal className="h-4 w-4 mr-2" />
              )}
              Filters
            </Button>

            {/* View Mode */}
            <div className="hidden sm:flex border border-border rounded-xl overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "small" ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => setViewMode("small")}
                title="Small grid"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "medium" ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => setViewMode("medium")}
                title="Medium grid"
              >
                <Grid2x2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "large" ? "default" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => setViewMode("large")}
                title="Large cards"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* COLLAPSIBLE FILTER PANEL */}
          {showFilters && (
            <div className="border-t border-border p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === "products" ? "default" : "outline"}
                  onClick={() => setActiveTab("products")}
                  className="rounded-xl"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Products
                </Button>
                <Button
                  variant={activeTab === "services" ? "default" : "outline"}
                  onClick={() => setActiveTab("services")}
                  className="rounded-xl"
                >
                  <BriefcaseBusiness className="h-4 w-4 mr-2" />
                  Services
                </Button>

                {/* Mobile View Toggle */}
                <div className="sm:hidden ml-auto flex border border-border rounded-xl overflow-hidden">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "small" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("small")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "medium" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("medium")}
                  >
                    <Grid2x2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "large" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("large")}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* FILTER GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <select
                  value={filters.businessType}
                  onChange={(e) =>
                    handleFilterChange("businessType", e.target.value)
                  }
                  className="h-11 px-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 bg-background"
                >
                  <option value="">All Business Types</option>
                  {businessTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>

                {activeTab === "products" ? (
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="h-11 px-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 bg-background"
                  >
                    <option value="">All Product Categories</option>
                    {productCategories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="h-11 px-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 bg-background"
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

                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="h-11 px-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 bg-background"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="h-11 rounded-xl"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* QUICK FILTERS */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.hasPromotion ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={() =>
                    handleFilterChange("hasPromotion", !filters.hasPromotion)
                  }
                >
                  <Gift className="h-4 w-4 mr-2" />
                  On Sale
                </Button>
                <Button
                  variant={filters.featured ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={() =>
                    handleFilterChange("featured", !filters.featured)
                  }
                >
                  <Star className="h-4 w-4 mr-2" />
                  Featured
                </Button>

                {(filters.category ||
                  filters.businessType ||
                  filters.hasPromotion ||
                  filters.featured ||
                  filters.minPrice ||
                  filters.maxPrice) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl ml-auto"
                    onClick={handleClearFilters}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MARKETPLACE HOME — Rich homepage when no filters active
          ═══════════════════════════════════════════════════════════ */}
      {!hasActiveFilters && activeTab === "products" ? (
        <div className="space-y-10">
          {/* Loading state */}
          {isLoading ? (
            <ProductCardSkeleton viewMode={getProductViewMode(viewMode)} count={8} />
          ) : (
            <>
              {/* Featured Products Carousel */}
              {featuredProducts.length > 0 && (
                <FeaturedProductsCarousel
                  products={featuredProducts}
                  onViewAll={() => handleFilterChange("featured", true)}
                  onProductClick={() => {}}
                />
              )}

              {/* Featured Stores */}
              <FeaturedStoresSection />

              {/* Business Type Showcase Sections */}
              {showcaseTypes.length > 0 && (
                <div className="space-y-2">
                  {showcaseTypes.map((type) => (
                    <BusinessTypeShowcase
                      key={type}
                      businessType={type}
                      products={productsByType[type]}
                    />
                  ))}
                </div>
              )}

              {/* Browse All Products */}
              <div>
                <h2 className="text-xl font-bold mb-4">Browse All Products</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {totalProducts} {totalProducts === 1 ? "product" : "products"} available
                </p>
                <div className={getGridClasses(viewMode)}>
                  {products.map((product: any) => (
                    <TypedProductCard
                      key={product.id}
                      product={product}
                      viewMode={getProductViewMode(viewMode)}
                      prodID={prodID}
                      setProdID={setProdID}
                    />
                  )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════
           FILTERED VIEW — Flat grid with pagination
           ═══════════════════════════════════════════════════════════ */
        <div>
          {/* Results summary */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              {activeTab === "products"
                ? `${totalProducts} ${totalProducts === 1 ? "product" : "products"} found`
                : `${totalServices} ${totalServices === 1 ? "service" : "services"} found`}
            </p>
          </div>

          {/* Loading */}
          {isLoading ? (
            <ProductCardSkeleton viewMode={getProductViewMode(viewMode)} count={8} />
          ) : activeTab === "products" ? (
            products.length === 0 ? (
              <EmptyState
                icon={emptyStateIcons.cart}
                title="No products found"
                description="Try adjusting your search or filter criteria"
                action={{ label: "Clear All Filters", onClick: handleClearFilters, variant: "outline" }}
              />
            ) : (
              <div className={getGridClasses(viewMode)}>
                {products.map((product: any) => (
                  <TypedProductCard
                    key={product.id}
                    product={product}
                    viewMode={getProductViewMode(viewMode)}
                  />
                ))}
              </div>
            )
          ) : services.length === 0 ? (
            <EmptyState
              icon={emptyStateIcons.search}
              title="No services found"
              description="Try adjusting your search or filter criteria"
              action={{ label: "Clear All Filters", onClick: handleClearFilters, variant: "outline" }}
            />
          ) : (
            <div className={getGridClasses(viewMode)}>
              {services.map((service: any) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  viewMode={getProductViewMode(viewMode)}
                />
              ))}
            </div>
          )}

          {/* Enhanced Pagination */}
          <EnhancedPagination
            page={page}
            totalPages={totalPages}
            totalItems={activeTab === "products" ? totalProducts : totalServices}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSearch={(query) => {
            handleFilterChange("search", query);
            setShowSearchModal(false);
          }}
        />
      )}
    </MotionPage>
  );
}
