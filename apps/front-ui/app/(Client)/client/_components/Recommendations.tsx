// app/client/_components/Recommendations.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CLIENT_RECOMMENDATIONS } from '@/graphql/client-panel.gql';
import { Button } from '@/components/ui/button';
import {
  Home,
  Star,
  ShoppingCart,
  BriefcaseBusiness,
  Users,
  Loader2,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';

interface RecommendationsProps {
  client: any;
}

export default function Recommendations({ client }: RecommendationsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>('all');
  const { showToast } = useToast();
  const {
    data: recommendationsData,
    loading: recommendationsLoading,
    error: recommendationsError
  } = useQuery(GET_CLIENT_RECOMMENDATIONS, {
    variables: { clientId: client.id }
  });

  const recommendations = recommendationsData?.clientRecommendations || [];

  // Filter recommendations by category
  const filteredRecommendations = activeCategory === 'all'
    ? recommendations
    : recommendations.filter((rec: any) => rec.type === activeCategory);

  // Get unique categories
  const categories = Array.from(
    new Set(recommendations.map((rec: any) => rec.type))
  ) as string[];

  if (recommendationsLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (recommendationsError) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Error Loading Recommendations</h3>
          <p className="text-muted-foreground mb-6">
            {recommendationsError.message}
          </p>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-6">
            We'll start showing personalized recommendations after you've made a few purchases.
          </p>

          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/marketplace'}
          >
            <ShoppingCart className="h-4 w-4" />
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Personalized Recommendations</h1>
            <p className="text-muted-foreground mt-1">
              Based on your purchase history and preferences
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category === 'product' ? 'Products' :
                  category === 'service' ? 'Services' :
                    category === 'business' ? 'Businesses' : category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Featured Recommendation */}
        {filteredRecommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Featured For You</h2>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-48">
                  {filteredRecommendations[0].items[0].media && filteredRecommendations[0].items[0].media.length > 0 ? (
                    <img
                      src={filteredRecommendations[0].items[0].media[0].url}
                      alt={filteredRecommendations[0].items[0].name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-border flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-lg">{filteredRecommendations[0].title}</h3>
                  <p className="text-muted-foreground mt-1 line-clamp-2">
                    {filteredRecommendations[0].description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {filteredRecommendations[0].items.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 bg-background border border-border rounded px-2 py-1">
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                    {filteredRecommendations[0].items.length > 2 && (
                      <span className="text-sm text-muted-foreground">
                        +{filteredRecommendations[0].items.length - 2} more items
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      {filteredRecommendations[0].reason}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        // In a real app, this would navigate to the recommended items
                        showToast('success', 'Redirecting', 'Taking you to recommended items');
                      }}
                    >
                      View Recommendations <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Sections */}
        <div className="space-y-8">
          {/* Products You Might Like */}
          {(activeCategory === 'all' || activeCategory === 'product') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Products You Might Like</h2>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations
                  .filter((rec: any) => rec.type === 'product')
                  .slice(0, 3)
                  .map((rec: any) => (
                    <div
                      key={rec.id}
                      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 bg-muted border-b border-border">
                        <h3 className="font-medium">{rec.title}</h3>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {rec.description}
                        </p>

                        <div className="space-y-2 mb-3">
                          {rec.items.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <span className="truncate">{item.name}</span>
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                          {rec.items.length > 2 && (
                            <div className="text-sm text-muted-foreground text-center pt-2 border-t border-border">
                              +{rec.items.length - 2} more items
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {rec.reason}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              showToast('success', 'Redirecting', 'Taking you to recommended products');
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Services You Might Need */}
          {(activeCategory === 'all' || activeCategory === 'service') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Services You Might Need</h2>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations
                  .filter((rec: any) => rec.type === 'service')
                  .slice(0, 3)
                  .map((rec: any) => (
                    <div
                      key={rec.id}
                      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 bg-muted border-b border-border">
                        <h3 className="font-medium">{rec.title}</h3>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {rec.description}
                        </p>

                        <div className="space-y-2 mb-3">
                          {rec.items.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <span className="truncate">{item.name}</span>
                              <span className="font-medium">
                                {item.isHourly ? `$${item.rate}/hr` : `$${item.rate} fixed`}
                              </span>
                            </div>
                          ))}
                          {rec.items.length > 2 && (
                            <div className="text-sm text-muted-foreground text-center pt-2 border-t border-border">
                              +{rec.items.length - 2} more services
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {rec.reason}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              showToast('success', 'Redirecting', 'Taking you to recommended services');
                            }}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Businesses You Might Like */}
          {(activeCategory === 'all' || activeCategory === 'business') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Businesses You Might Like</h2>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations
                  .filter((rec: any) => rec.type === 'business')
                  .slice(0, 3)
                  .map((rec: any) => (
                    <div
                      key={rec.id}
                      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 bg-muted border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                            {rec.items[0].business.name.charAt(0)}
                          </div>
                          <h3 className="font-medium truncate">{rec.items[0].business.name}</h3>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {rec.description}
                        </p>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-warning" />
                            <span>4.7 (124 reviews)</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rec.items.slice(0, 2).map((item: any) => (
                              <span
                                key={item.id}
                                className="text-xs bg-muted px-2 py-1 rounded-full"
                              >
                                {item.category || 'General'}
                              </span>
                            ))}
                            {rec.items.length > 2 && (
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                +{rec.items.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {rec.reason}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              showToast('success', 'Redirecting', 'Taking you to business profile');
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* How Recommendations Work */}
        <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">How Our Recommendations Work</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI-powered recommendation engine analyzes your purchase history,
                browsing behavior, and preferences to suggest products, services,
                and businesses you might like. The more you use Uscor, the better
                our recommendations become.
              </p>

              <div className="mt-3 p-3 bg-background rounded-lg border border-border">
                <p className="text-sm">
                  <span className="font-medium">Pro Tip:</span> For bookstore customers,
                  we recommend educational materials based on your previous purchases.
                  Teachers and students get personalized recommendations for classroom resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}