'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import ProductListing from './ProductListing';
import { ProductEntity } from '@/lib/types';
import { removeTypename } from '@/lib/removeTypeName';
import MasonryGrid, { ProductGridItem } from './seraui/MasonryGrid';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  query: any; // Apollo query document
  variables?: Record<string, any>;
  limit?: number;
  field?: 'relatedProducts' | 'products'; // specify which field to extract from the query result
}

const FALLBACK_LIMIT = 4;

export default function ProductReel({
  title,
  subtitle,
  href,
  query,
  variables,
  limit = FALLBACK_LIMIT,
  field = 'products',
}: ProductReelProps) {
  const { data, loading, error } = useQuery(query, { variables });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      if (field === 'relatedProducts' && data.relatedProducts) {
        const formatted = data.relatedProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: product.quantity,
          href: `/marketplace/products/${product.id}`,
          imageUrl: product.medias[0]?.url,
          categoryName: product.category?.name || 'Uncategorized',
          businessName: product.business?.name || 'Unknown Vendor',
          businessAvatarUrl: product.business?.avatar || null,
        }));
        setProducts(formatted);
      } else if (field === 'products' && data.products) {
        const formatted = data.products.map((product: any) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: product.quantity,
          href: `/marketplace/products/${product.id}`,
          imageUrl: product.medias[0]?.url,
          categoryName: product.category?.name || 'Uncategorized',
          businessName: product.business?.name || 'Unknown Vendor',
          businessAvatarUrl: product.business?.avatar || null,
        }));
        setProducts(formatted);
      }
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-xl">
      <div className="md:flex md:items-center md:justify-between mb-4">
        <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
          {title && <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>}
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {loading && (
        <div className="flex flex-col bg-transparent justify-center items-center">
          <div className="w-8 h-8 bg-orange-600 rounded mt-20 animate-spin"></div>
          <h3 className="font-medium text-gray-700  text-xl">Loading products ...</h3>
        </div>
      )}
      {error && <p className="text-center text-red-500">Error: {error.message}</p>}
      {products && products.length > 0 ? (
        <MasonryGrid
          items={products}
          GridItem={ProductGridItem}
          onLike={(id) => console.log(`Liked service ${id}`)}
        />
      ) : !loading && (
        <div className="flex flex-col justify-center mt-20 items-center">
          <AlertTriangle />
          <h3 className='font-medium text-gray-700 text-xl'>No Items Displayed</h3>
        </div>
      )}
    </div>
  );
}
