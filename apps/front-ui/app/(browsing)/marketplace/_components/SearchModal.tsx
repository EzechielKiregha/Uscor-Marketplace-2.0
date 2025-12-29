'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  X,
  Loader2,
  ShoppingCart,
  BriefcaseBusiness,
  Star
} from 'lucide-react';
import { useQuery } from '@apollo/client';
import { SEARCH_MARKETPLACE } from '@/graphql/marketplace.gql';

interface SearchModalProps {
  onClose: () => void;
  onSearch: (query: string) => void;
}

export default function SearchModal({ onClose, onSearch }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const {
    data: searchData,
    loading: searchLoading,
    error: searchError
  } = useQuery(SEARCH_MARKETPLACE, {
    variables: { query: debouncedQuery },
    skip: !debouncedQuery
  });

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // Show results when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Input
              type="text"
              placeholder="Search products and services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-16 py-2"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="ml-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {showResults && (
          <div className="p-4">
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Error searching: {searchError.message}</p>
              </div>
            ) : !searchData?.searchMarketplace?.products?.length && !searchData?.searchMarketplace?.services?.length ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Products Results */}
                {searchData?.searchMarketplace?.products?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Products
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSearch(searchQuery)}
                      >
                        View All
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {searchData.searchMarketplace.products.slice(0, 3).map((product: any) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer"
                          onClick={() => {
                            window.location.href = `/marketplace/products/${product.id}`;
                            onClose();
                          }}
                        >
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {product.medias && product.medias.length > 0 ? (
                              <img
                                src={product.medias[0].url}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{product.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="font-bold">${product.price.toFixed(2)}</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" />
                                <span className="text-xs">4.7</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Results */}
                {searchData?.searchMarketplace?.services?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <BriefcaseBusiness className="h-5 w-5" />
                        Services
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSearch(searchQuery)}
                      >
                        View All
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {searchData.searchMarketplace.services.slice(0, 3).map((service: any) => (
                        <div
                          key={service.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer"
                          onClick={() => {
                            window.location.href = `/freelance-gigs/${service.id}`;
                            onClose();
                          }}
                        >
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {service.medias && service.medias.length > 0 ? (
                              <img
                                src={service.medias[0].url}
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BriefcaseBusiness className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{service.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {service.description}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="font-bold">
                                {service.isHourly ? `$${service.rate}/hr` : `$${service.rate} fixed`}
                              </p>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" />
                                <span className="text-xs">4.5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!showResults && searchQuery && (
          <div className="p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Type to search products and services...</p>
          </div>
        )}
      </div>
    </div>
  );
}