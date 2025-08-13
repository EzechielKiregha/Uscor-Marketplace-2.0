'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FEATURED_PRODUCTS } from '@/graphql/product.gql';
import MasonryGrid from './MasonryGrid';

export default function FeaturedProducts() {
  const { data, error, loading } = useQuery(GET_FEATURED_PRODUCTS);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      const formatted = data.products.map((product: any) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: product.quantity,
        href: `/marketplace/products/${product.id}`,
        imageUrl: product.medias?.url || `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`,
        categoryName: product.category?.name || 'Uncategorized',
        businessName: product.business?.name || 'Unknown Vendor',
        businessAvatarUrl: product.business?.avatar || null,
      }));
      setProducts(formatted);
    }
  }, [data]);

  if (loading) return (
    <div className="flex flex-col my-20 bg-background dark:bg-gray-950 justify-center items-center">
      <div className="w-8 h-8 bg-orange-600 rounded animate-spin"></div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col my-20 bg-background dark:bg-gray-950 justify-center items-center">
      <div className="w-8 h-8 bg-orange-600 rounded animate-spin"></div>
    </div>
  );

  const handleLike = (id: string | number) => {
    console.log('Liked product:', id);
    // Add to wishlist, etc.
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground mb-8">Featured Products</h2>
      <MasonryGrid products={products} onLike={handleLike} />
    </section>
  );
}