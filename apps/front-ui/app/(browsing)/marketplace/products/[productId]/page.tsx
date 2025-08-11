'use client';

import { useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID } from '@/graphql/product.gql';
import AddToCartButton from '@/components/AddToCartButton';
import ImageSlider from '@/components/ImageSlider';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import ProductReel from '@/components/ProductReel';
import { PRODUCT_CATEGORIES } from '@/config';
import { formatPrice } from '@/lib/utils';
import { Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { notFound, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

const BREADCRUMBS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'Products', href: '/marketplace/products' },
];

export default async function Page() {
  const productId = useSearchParams().get('productId');
  const router = useRouter();

  if (!productId) return (
    toast.error('Product ID is required to view product details.'),
    notFound()
  );

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
  });

  if (loading) return <p className="text-center py-10 text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-center py-10 text-destructive">Failed to load product</p>;

  const product = data?.product;
  if (!product || product.approvedForSale !== 'approved') return notFound();

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

  const validUrls = (product.medias || [])
    .map((img: any) => img.url)
    .filter(Boolean);

  // Add product name to breadcrumbs
  BREADCRUMBS.push({ id: 3, name: product.name, href: '' });

  return (
    <MaxWidthWrapper className="bg-background dark:bg-gray-950">
      <div className="bg-background dark:bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          {/* Product Details */}
          <div className="lg:max-w-lg lg:self-end">
            {/* Breadcrumbs */}
            <ol className="flex items-center space-x-2 text-sm">
              {BREADCRUMBS.map((breadcrumb, i) => (
                <li key={breadcrumb.href} className="flex items-center">
                  {breadcrumb.href ? (
                    <Link
                      href={breadcrumb.href}
                      className="font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {breadcrumb.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-foreground">{breadcrumb.name}</span>
                  )}
                  {i !== BREADCRUMBS.length - 1 && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="mx-2 h-4 w-4 text-muted-foreground"
                    >
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  )}
                </li>
              ))}
            </ol>

            {/* Title */}
            <div className="mt-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
            </div>

            {/* Price & Category */}
            <section className="mt-4">
              <div className="flex items-center">
                <p className="font-medium text-2xl text-foreground">
                  {formatPrice(product.price)}
                </p>
                <div className="ml-4 border-l border-border pl-4 text-sm text-muted-foreground">
                  {label}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <p className="text-base text-foreground/90 leading-relaxed">{product.description}</p>
              </div>

              {/* Benefits */}
              <div className="mt-6 flex items-center">
                <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="ml-2 text-sm text-muted-foreground">Eligible for fast delivery</p>
              </div>
            </section>
          </div>

          {/* Product Images */}
          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
            <div className="aspect-square rounded-xl overflow-hidden border border-border/50 shadow-sm">
              <ImageSlider urls={validUrls} />
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
            <div className="space-y-6">
              <AddToCartButton product={product} />
              <div className="text-center">
                <div className="inline-flex items-center text-sm text-muted-foreground">
                  <Shield className="mr-2 h-5 w-5" aria-hidden="true" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <ProductReel
        href="/marketplace/products"
        query={{ category: product.category, limit: 4 }}
        title={`Similar to ${label}`}
        subtitle={`Browse more ${label} products of high quality, just like '${product.name}'`}
      />
    </MaxWidthWrapper>
  );
}