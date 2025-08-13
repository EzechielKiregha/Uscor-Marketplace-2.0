'use client';

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import ProductReel from '@/components/ProductReel';
import FeaturedProducts from '@/components/seraui/FeaturedProducts';
import Footer from '@/components/seraui/FooterSection';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import { Button, buttonVariants } from '@/components/ui/button';
import { GET_FEATURED_PRODUCTS } from '@/graphql/product.gql';
import { useNavigation } from '@/hooks/useNavigation';
import { ArrowDownToLine, DollarSign, Paintbrush } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// --- Perks Data (in English) ---
const perks = [
  {
    name: 'Fast Delivery',
    Icon: ArrowDownToLine,
    description: 'Receive your furniture quickly and efficiently, delivered right to your doorstep.',
  },
  {
    name: 'Affordable Pricing',
    Icon: DollarSign,
    description: 'We offer high-quality furniture at prices that respect your budget.',
  },
  {
    name: 'Custom Designs',
    Icon: Paintbrush,
    description: 'Personalize your space with our custom-made furniture, tailored to your style.',
  },
];

// --- Main Export ---
export default function MarketplacePage() {
  const nav = useNavigation();

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      {/* Header */}
      <HeaderComponent />

      {/* Main Content */}
      <main className="flex-1">
        <MaxWidthWrapper>
          {/* Hero */}
          <div className="py-20 mx-auto text-center flex flex-col items-center max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Transform Your Space with{' '}
              <span className="text-primary">Modern World Furniture</span>
            </h1>
            <Link href='/'>
              <Image alt='logo' src='/logo.png' width={80} height={70} />
            </Link>
            <p className="mt-6 text-lg max-w-prose text-muted-foreground">
              Discover elegant and accessible furniture that blends style and comfort.
              Uscor Marketplace helps you create unique and inspiring spaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                onClick={() => nav('/products')}
                className={buttonVariants({
                  className: 'bg-primary hover:bg-accent hover:text-primary-foreground text-primary-foreground',
                })}
              >
                Explore
              </Button>
              <Button
                onClick={() =>
                  nav('/products?category=furniture_living&sort=desc')
                }
                variant="ghost"
              >
                High-Quality Products &rarr;
              </Button>
            </div>
          </div>

          {/* New Arrivals */}

          {/* <ProductReel
            title="Featured Products"
            href="/marketplace/products"
            query={GET_FEATURED_PRODUCTS}
            limit={4}
          /> */}

          <FeaturedProducts />
        </MaxWidthWrapper>

        {/* Perks Section */}
        <section className="border-t border-border bg-muted">
          <MaxWidthWrapper>
            <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
              {perks.map((perk) => (
                <div
                  key={perk.name}
                  className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
                >
                  <div className="flex md:flex-shrink-0 justify-center">
                    <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <perk.Icon className="h-1/3 w-1/3" />
                    </div>
                  </div>
                  <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                    <h3 className="font-medium text-base text-foreground">
                      {perk.name}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {perk.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </MaxWidthWrapper>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}