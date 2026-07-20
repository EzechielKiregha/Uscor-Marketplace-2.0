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
    <MotionPage className="container mx-auto px-4 py-0">
      {/* Hero */}
      <section className="relative py-14 md:py-18 px-4 sm:px-6 lg:px-8 overflow-hidden -mx-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-orange-500/8 dark:bg-orange-500/5 blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200 dark:border-orange-800/50 mb-5">
            <ShoppingCart className="h-3.5 w-3.5" />
            Shop Local
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-500">
              USCOR Marketplace
            </span>
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover products and services from verified local businesses.
            Shop, compare, and get it delivered.
          </p>
        </div>
      </section>

      {/* Tabs + Category Scroll */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab("products")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === "services"
                ? "border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Services
          </button>
        </div>
        <HorizontalCategoryScroll
          selected={filters.businessType}
          onSelect={(bt) => handleFilterChange("businessType", bt)}
        />
      </div>

      {/* Search + Controls */}
      <div className="sticky top-2 z-40 mb-6">
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-sm p-3 flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Input
              type="text"
              placeholder={activeTab === "products" ? "Search products..." : "Search services..."}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9 h-10 rounded-lg bg-background text-sm"
              onClick={() => setShowSearchModal(true)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="hidden sm:block h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>

          {/* Filters Toggle */}
          <Button
            variant={showFilters ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10 rounded-lg shrink-0"
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          </Button>

          {/* View Mode - desktop */}
          <div className="hidden md:flex items-center border border-border rounded-lg overflow-hidden">
            {([
              { mode: "list" as const, icon: <List className="h-4 w-4" /> },
              { mode: "small" as const, icon: <Grid3x3 className="h-4 w-4" /> },
              { mode: "medium" as const, icon: <Grid2x2 className="h-4 w-4" /> },
              { mode: "large" as const, icon: <Square className="h-4 w-4" /> },
            ]).map(({ mode, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 transition-colors ${
                  viewMode === mode
                    ? "bg-orange-600 text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                title={mode}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-2 bg-card border border-border rounded-xl p-4 shadow-sm animate-in slide-in-from-top-1 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={filters.businessType}
                onChange={(e) => handleFilterChange("businessType", e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">All Business Types</option>
                {businessTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>

              {activeTab === "products" ? (
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="h-10 px-3 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">All Categories</option>
                  {productCategories.map((category: any) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="h-10 px-3 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">All Service Types</option>
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
                <Input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </div>

              {/* Sort - mobile only (already shown in toolbar on desktop) */}
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="sm:hidden h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Quick filters + Clear */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
              <button
                onClick={() => handleFilterChange("hasPromotion", !filters.hasPromotion)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filters.hasPromotion
                    ? "bg-orange-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Gift className="h-3 w-3" />
                On Sale
              </button>
              <button
                onClick={() => handleFilterChange("featured", !filters.featured)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filters.featured
                    ? "bg-orange-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className="h-3 w-3" />
                Featured
              </button>

              {(filters.category || filters.businessType || filters.hasPromotion ||
                filters.featured || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={handleClearFilters}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
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
