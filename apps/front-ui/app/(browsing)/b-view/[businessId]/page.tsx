// app/business/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  GET_BUSINESS_BY_ID,
  GET_BUSINESS_PRODUCTS,
  GET_BUSINESS_SERVICES,
  GET_BUSINESS_REVIEWS,
  ON_BUSINESS_UPDATED
} from '@/graphql/business-page.gql';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  ShoppingCart,
  BriefcaseBusiness,
  Users,
  MessageSquare,
  Plus,
  Filter,
  ShieldCheck,
  Gift
} from 'lucide-react';
import BusinessHeader from './_components/BusinessHeader';
import ProductsSection from './_components/ProductsSection';
import ServicesSection from './_components/ServicesSection';
import WorkersSection from './_components/WorkersSection';
import ReviewsSection from './_components/ReviewsSection';
import { useMe } from '@/lib/useMe';
import Loader from '@/components/seraui/Loader';
import { set } from 'date-fns';
import { useSearchParam } from 'react-use';
import { useParams, useSearchParams } from 'next/navigation';

interface BusinessPageProps {
  params: {
    businessId: string;
  };
}

export default function BusinessPage() {
  const { user, loading: authLoading } = useMe();

  const params = useParams();
  const businessId = params.businessId;

  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'workers' | 'reviews'>('products');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const {
    data: businessData,
    loading: businessLoading,
    refetch: refetchBusiness
  } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { id: businessId }
  });

  const {
    data: productsData,
    loading: productsLoading
  } = useQuery(GET_BUSINESS_PRODUCTS, {
    variables: {
      businessId: businessId,
      storeId: selectedStoreId || undefined
    },
    skip: activeTab !== 'products'
  });

  const {
    data: servicesData,
    loading: servicesLoading
  } = useQuery(GET_BUSINESS_SERVICES, {
    variables: {
      businessId: businessId
    },
    skip: activeTab !== 'services'
  });

  const {
    data: reviewsData,
    loading: reviewsLoading
  } = useQuery(GET_BUSINESS_REVIEWS, {
    variables: {
      businessId: businessId
    },
    skip: activeTab !== 'reviews'
  });

  // Handle real-time updates
  useSubscription(ON_BUSINESS_UPDATED, {
    variables: { businessId: businessId },
    onData: ({ data }) => {
      refetchBusiness();
    }
  });

  const business = businessData?.business;
  const products = productsData?.businessProducts || [];
  const services = servicesData?.businessServices || [];
  const reviews = reviewsData?.businessReviews?.items || [];

  if (businessLoading) return <Loader loading={true} />;

  if (!business) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Business Not Found</h1>
        <p className="text-muted-foreground mt-2">The business you're looking for doesn't exist or has been removed.</p>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Business Header */}
        <BusinessHeader
          business={business}
          isCurrentUser={user?.id === business.id}
        />

        {/* Business Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="font-bold text-lg">{business.totalProductsSold}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="font-bold text-lg">{business.freelanceServices.length}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Workers</p>
                <p className="font-bold text-lg">{business.totalWorkers}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-bold text-lg">4.8 ⭐</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Business Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Contact Information</h3>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{business.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{business.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{business.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Selection */}
            {business.stores.length > 1 && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Store Locations</h3>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    {business.stores.map((store: any) => (
                      <Button
                        key={store.id}
                        variant={selectedStoreId === store.id ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedStoreId(selectedStoreId === store.id ? null : store.id)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <div className="text-left">
                            <p className="font-medium">{store.name}</p>
                            <p className="text-xs text-muted-foreground">{store.address}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Business Actions */}
            <div className="space-y-3">
              {user && user?.id !== business.id && (
                <>
                  <Button variant="default" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Business
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    Save Business
                  </Button>
                </>
              )}

              {user?.id === business.id && (
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product/Service
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Discover More</h3>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/businesses?loyalty=true'}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Businesses with Loyalty Programs
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/businesses?promotions=true'}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Businesses with Promotions
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/businesses?b2b=true'}
                >
                  <BriefcaseBusiness className="h-4 w-4 mr-2" />
                  B2B Service Providers
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/businesses?verified=true'}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verified Businesses
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <Button
                variant={activeTab === 'products' ? 'default' : 'ghost'}
                className="mr-4"
                onClick={() => setActiveTab('products')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Products
              </Button>
              <Button
                variant={activeTab === 'services' ? 'default' : 'ghost'}
                className="mr-4"
                onClick={() => setActiveTab('services')}
              >
                <BriefcaseBusiness className="h-4 w-4 mr-2" />
                Services
              </Button>
              <Button
                variant={activeTab === 'workers' ? 'default' : 'ghost'}
                className="mr-4"
                onClick={() => setActiveTab('workers')}
              >
                <Users className="h-4 w-4 mr-2" />
                Workers
              </Button>
              <Button
                variant={activeTab === 'reviews' ? 'default' : 'ghost'}
                className="mr-4"
                onClick={() => setActiveTab('reviews')}
              >
                <Star className="h-4 w-4 mr-2" />
                Reviews
              </Button>
            </div>

            {/* Content Area */}
            {activeTab === 'products' && (
              <ProductsSection
                products={products}
                loading={productsLoading}
                business={business}
                selectedStoreId={selectedStoreId}
                setSelectedStoreId={setSelectedStoreId}
              />
            )}

            {activeTab === 'services' && (
              <ServicesSection
                services={services}
                loading={servicesLoading}
                business={business}
              />
            )}

            {activeTab === 'workers' && (
              <WorkersSection
                workers={business.workers}
                loading={businessLoading}
                business={business}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection
                reviews={reviews}
                loading={reviewsLoading}
                business={business}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}