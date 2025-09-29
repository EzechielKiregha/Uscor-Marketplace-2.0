"use client"
import { logos1, logos2 } from '@/components/icons/Logos';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import FeaturedProducts from '@/components/seraui/FeaturedProducts';
import FeaturesSection from '@/components/seraui/FeaturesSection';
import Footer from '@/components/seraui/FooterSection';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import HeroSection from '@/components/seraui/HeroSection';
import MarqueeScroller from '@/components/seraui/MarqueeScroller';
import PricingSection from '@/components/seraui/PricingSection';
import TeamSection from '@/components/seraui/TeamMemberCard';
import TestimonialSection from '@/components/seraui/TestimonialSection';
import { ArrowDownToLine, DollarSign, Paintbrush } from 'lucide-react';
import AccordionLast from './(browsing)/faq/accordion-last';

// --- Perks Data (in English) ---
const perks = [
  {
    name: 'Fast Delivery',
    Icon: ArrowDownToLine,
    description: 'Make the most of your time by enjoying your purchases, quick and reliable delivery right to your doorstep.',
  },
  {
    name: 'Affordable Pricing',
    Icon: DollarSign,
    description: 'We offer high-quality products at prices that respect your budget.',
  },
  {
    name: 'Custom Designs',
    Icon: Paintbrush,
    description: 'Personalize your space with our custom-made products, tailored to your style.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      {/* Header */}
      <HeaderComponent />

      {/* Hero */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturesSection />

      {/* <FeaturedProducts title='Featured Products' subtitle='' href='/marketplace/products' /> */}
      <section className=" bg-muted">
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

      {/* Logos Marquee */}
      <div className="py-12 px-4">
        <MarqueeScroller items={logos1} speed="25s" direction="forwards" itemWidth="120px" />
        <div className="mt-10">
          <MarqueeScroller items={logos2} speed="30s" direction="reverse" itemWidth="120px" />
        </div>
      </div>
      {/* Pricing */}
      <PricingSection />

      {/* Team */}
      <TeamSection />

      {/* Testimonials */}
      <TestimonialSection />

      <div className="py-8">
        <AccordionLast />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}