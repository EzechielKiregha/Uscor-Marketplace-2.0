"use client"
import { AuroraHero } from '@/components/AuroraHero';
import { Icons } from '@/components/Icons';
import { HowItWorks, NewsletterSignup, StatsSection, Testimonials } from '@/components/landing-components';
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { PlatformFeatures } from '@/components/platform-features';
import ProductReel from '@/components/ProductReel';
import { Button, buttonVariants } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { ArrowDownToLine, DollarSign, Paintbrush } from 'lucide-react';

const perks = [
  {
    name: 'Livraison Rapide',
    Icon: ArrowDownToLine,
    description: 'Recevez vos meubles rapidement et efficacement, directement à votre porte.'
  },
  {
    name: 'Prix Abordables',
    Icon: DollarSign,
    description: 'Nous offrons des meubles de haute qualité à des prix qui respectent votre budget.'
  },
  {
    name: 'Conceptions Personnalisées',
    Icon: Paintbrush,
    description: 'Personnalisez votre espace avec nos meubles sur mesure, adaptés à votre style.'
  }
];


export default function Home() {
  const nav = useNavigation()

  return (
    <>
      <AuroraHero />
      <MaxWidthWrapper>

        <StatsSection />
        <PlatformFeatures />
        <ProductReel
          query={{
            sort: "desc",
            limit: 4
          }}
          href='/products'
          title='Tout neuf'
        />
        <div className="grid grid-cols-1 gap-y-12 py-4 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {perks.map((perk) => (
            <div
              key={perk.name}
              className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
            >
              <div className="flex md:flex-shrink-0 justify-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full dark:bg-gray-700 dark:text-blue-100 bg-blue-100 text-blue-900">
                  {<perk.Icon className='h-1/3 w-1/3' />}
                </div>
              </div>
              <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                <h3 className="font-medium text-base text-gray-900 dark:text-gray-300">{perk.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
      {/* <Testimonials /> */}
    </>
  );
}
