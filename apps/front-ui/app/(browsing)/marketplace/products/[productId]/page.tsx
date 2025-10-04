'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCT_BY_ID, GET_RELATED_PRODUCTS } from '@/graphql/product.gql';
import { CREATE_CHAT } from '@/graphql/chat.gql';
import AddToCartButton from '@/components/AddToCartButton';
import ImageSlider from '@/components/ImageSlider';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import ProductReel from '@/components/ProductReel';
import { PRODUCT_CATEGORIES } from '@/config/product-categories';
import { formatPrice } from '@/lib/utils';
import { Check, Shield, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useGetProductIdParam } from '@/hooks/use-get-product-params';
import Footer from '@/components/seraui/FooterSection';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import { removeTypename } from '@/lib/removeTypeName';
import { useMe } from '@/lib/useMe';
import { GlowButton } from '@/components/seraui/GlowButton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast-provider';

const BREADCRUMBS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'marketplace', href: '/marketplace' },
  { id: 3, name: 'Products', href: '/marketplace/products' },
];

export default function Page() {

  const productId = useGetProductIdParam();
  const user = useMe();
  const router = useRouter();
  const { showToast } = useToast();

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
  });

  const [createChat, { loading: chatLoading }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      showToast("success", "Success", 'Chat started successfully', true, 5000);
      router.push(`/marketplace/chat?currentId${data.createChat.id}`);
    },
    onError: (error) => {
      showToast("error", "Failed", 'Failed to start chat: ' + error.message, true, 5000);
    },
  });

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 justify-center items-center">
      <div className="w-8 h-8 bg-orange-600 rounded animate-spin"></div>
    </div>
  );
  if (error) {
    showToast("error", "Failed", 'Failed to load product details', true, 5000);
    return <p className="text-center py-10 text-destructive">Error loading product</p>;
  }
  if (!productId) {
    showToast("error", "Failed", 'Product ID is required', true, 5000);
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

  const handleChat = () => {
    if (!user) {
      showToast("error", "Failed", 'Please log in to start a chat.', true, 5000);
      return;
    }
    createChat({
      variables: {
        input: {
          productId: cleanedProduct.id,
          participantIds: [user.id, cleanedProduct.business?.id],
          isSecure: true,
          negotiationType: 'PURCHASE',
        },
      },
    });
  };

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
                <div className="flex space-x-2">
                  <AddToCartButton product={cleanedProduct} />
                  <Button
                    onClick={handleChat}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                    disabled={chatLoading}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{chatLoading ? 'Starting...' : 'Chat'}</span>
                  </Button>
                </div>
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