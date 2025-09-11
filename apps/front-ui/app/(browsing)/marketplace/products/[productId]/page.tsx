'use client';

import { useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID, GET_RELATED_PRODUCTS } from '@/graphql/product.gql';
import AddToCartButton from '@/components/AddToCartButton';
import ImageSlider from '@/components/ImageSlider';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import ProductReel from '@/components/ProductReel';
import { PRODUCT_CATEGORIES } from '@/config/product-categories';
import { formatPrice } from '@/lib/utils';
import { Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';
import { useGetProductIdParam } from '@/hooks/use-get-product-params';
import Footer from '@/components/seraui/FooterSection';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import { removeTypename } from '@/lib/removeTypeName';

const BREADCRUMBS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'marketplace', href: '/marketplace' },
  { id: 3, name: 'Products', href: '/marketplace/products' },
];

export default function Page() {

  const productId = useGetProductIdParam();

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
  });

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 justify-center items-center">
      <div className="w-8 h-8 bg-orange-600 rounded animate-spin"></div>
    </div>
  );
  if (error) {
    toast.error('Failed to load product details');
    return <p className="text-center py-10 text-destructive">Error loading product</p>;
  }
  if (!productId) {
    toast.error('Product ID is required');
    return notFound();
  }

  const product = data?.product;
  if (!product) return notFound();

  // Clean product data to remove __typename
  const cleanedProduct = removeTypename(product);

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === cleanedProduct.category?.name
  )?.label;

  const validUrls = (cleanedProduct.medias || [])
    .map((img: any) => img.url)
    .filter(Boolean);

  // Add product name to breadcrumbs
  if (BREADCRUMBS.length < 4) {
    BREADCRUMBS.push({ id: 4, name: cleanedProduct.title, href: '' });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      {/* Header */}
      <HeaderComponent />
      <MaxWidthWrapper className="bg-background dark:bg-gray-950">
        <div className="bg-background dark:bg-gray-950">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            {/* Product Details */}
            <div className="lg:max-w-lg lg:self-end">
              {/* Breadcrumbs */}
              <ol className="flex items-center space-x-2 text-sm">
                {BREADCRUMBS.map((breadcrumb, i) => (
                  <li key={i} className="flex items-center">
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
                  {cleanedProduct.name}
                </h1>
              </div>

              {/* Price & Category */}
              <section className="mt-4">
                <div className="flex items-center">
                  <p className="font-medium text-2xl text-foreground">
                    {formatPrice(cleanedProduct.price)}
                  </p>
                  <div className="ml-4 border-l border-border pl-4 text-sm text-muted-foreground">
                    {label}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <p className="text-base text-foreground/90 leading-relaxed">{cleanedProduct.description}</p>
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
                <AddToCartButton product={cleanedProduct} />
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
          query={GET_RELATED_PRODUCTS}
          field='relatedProducts'
          variables={{ category: cleanedProduct.category?.name }}
          title={`Similar to ${cleanedProduct.category?.name}`}
          subtitle={`Browse more ${cleanedProduct.category?.name} products of high quality, just like '${cleanedProduct.title}'`}
        />
      </MaxWidthWrapper>
      {/* Footer */}
      <Footer />
    </div>
  );
}