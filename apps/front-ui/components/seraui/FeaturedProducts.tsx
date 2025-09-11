'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FEATURED_PRODUCTS } from '@/graphql/product.gql';
import MasonryGrid, { ProductGridItem } from './MasonryGrid';
import Loader from './Loader';
import Link from 'next/link';

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  variables?: Record<string, any>;
  limit?: number;
}

export default function FeaturedProducts({
  title,
  subtitle,
  href,
  variables,
}: ProductReelProps

) {
  const { data, error, loading } = useQuery(GET_FEATURED_PRODUCTS);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      const formatted = data.featuredProducts.map((product: any) => ({
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
  }, [data]);

  if (loading) return <Loader loading={true} />;
  if (error) return <Loader loading={true} />;

  const handleLike = (id: string | number) => {
    console.log('Liked product:', id);
    // Add to wishlist, etc.
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-4">
        <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
          {title && <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>}
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="hidden text-sm font-medium underline md:block"
          >
            See more &rarr;
          </Link>
        )}
      </div>
      <MasonryGrid items={products} GridItem={ProductGridItem} onLike={handleLike} />
    </section>
  );
}