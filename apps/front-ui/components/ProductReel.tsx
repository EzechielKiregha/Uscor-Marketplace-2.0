'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import ProductListing from './ProductListing';
import { ProductEntity } from '@/lib/types';
import { removeTypename } from '@/graphql/product.gql';

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  query: any; // Apollo query document
  variables?: Record<string, any>;
  limit?: number;
}

const FALLBACK_LIMIT = 4;

export default function ProductReel({
  title,
  subtitle,
  href,
  query,
  variables,
  limit = FALLBACK_LIMIT,
}: ProductReelProps) {
  const { data } = useQuery(query, { variables });

  const products: ProductEntity[] = data?.products || [];

  const productsData = products.map((product: ProductEntity) => ({
    ...removeTypename(product)
  }));

  const displayItems = productsData.length
    ? products
    : Array.from({ length: limit }, () => null);

  return (
    <section className="py-12 mx-1.5 sm:mx-0">
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
      <div className="relative mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 lg:gap-x-8">
        {displayItems.map((product, i) => (
          <ProductListing key={`product-${i}`} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
