// app/business/[id]/_components/ProductsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Filter,
  Grid,
  List,
  Star,
  Tag,
  Search
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Button } from '@/components/ui/button';
import { ProductEntity } from '@/lib/types';

interface ProductsSectionProps {
  products: ProductEntity[];
  loading: boolean;
  business: any;
  selectedStoreId: string | null;
  setSelectedStoreId: (selectedStoreId: string | null) => void;
}

export default function ProductsSection({
  products,
  loading,
  business,
  selectedStoreId,
  setSelectedStoreId,
}: ProductsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(null);
  const { showToast } = useToast();

  // Extract unique categories from products
  const categories = Array.from(
    new Set(products.map(product => product.category?.name).filter(Boolean))
  );

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title !== undefined ? product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) : false;

    const matchesCategory = selectedCategory ? product.category?.name === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  // console.log('Filtered Products:', filteredProducts);

  if (loading) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'This business has not added any products yet'}
          </p>

          {(searchQuery || selectedCategory) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {selectedCategory ? categories.find(c => c === selectedCategory) : 'All Categories'}
            </Button>
            {categories.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-md shadow-lg z-10 hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="w-full px-4 py-2 text-left hover:bg-muted"
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="w-full px-4 py-2 text-left hover:bg-muted"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex border border-orange-400/60 dark:border-orange-500/70 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
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

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative pb-[100%] h-0">
                  {product.medias && product.medias.length > 0 ? (
                    <img
                      src={product.medias[0].url}
                      alt={product.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium truncate">{product.title}</h3>
                      {product.category && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full mt-1 inline-block">
                          {product.category?.name}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${product.price.toFixed(2)}</p>
                      {product.quantity < 5 && product.quantity > 0 && (
                        <p className="text-xs text-warning mt-1">Low stock</p>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-warning mr-1" />
                      <span className="text-sm">4.7 (124)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast('success', 'Success', 'Added to cart')}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredProducts.map(product => (
            <div key={product.id} className="p-4 hover:bg-muted/50">
              <div className="flex gap-4">
                <div className="w-24 h-24 flex-shrink-0 border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                  {product.medias && product.medias.length > 0 ? (
                    <img
                      src={product.medias[0].url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      {product.category && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full mt-2 inline-block">
                          {product.category?.name}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
                      {product.quantity < 5 && product.quantity > 0 && (
                        <p className="text-xs text-warning mt-1">Low stock</p>
                      )}
                      <Button
                        variant="default"
                        className="mt-2"
                        onClick={() => showToast('success', 'Success', 'Added to cart')}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store Selection Notice */}
      {selectedStoreId && (
        <div className="p-4 bg-muted border-t border-border">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>
              Showing products from{' '}
              <strong>
                {business.stores.find((s: any) => s.id === selectedStoreId)?.name}
              </strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStoreId(null)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}