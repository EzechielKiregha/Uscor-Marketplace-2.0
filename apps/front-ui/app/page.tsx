"use client"
import { logos1, logos2 } from '@/components/icons/Logos';
import FeaturedProducts from '@/components/seraui/FeaturedProducts';
import FeaturesSection from '@/components/seraui/FeaturesSection';
import Footer from '@/components/seraui/FooterSection';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import HeroSection from '@/components/seraui/HeroSection';
import MarqueeScroller from '@/components/seraui/MarqueeScroller';
import PricingSection from '@/components/seraui/PricingSection';
import TeamSection from '@/components/seraui/TeamMemberCard';
import TestimonialSection from '@/components/seraui/TestimonialSection';



export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      {/* Header */}
      <HeaderComponent />

      {/* Hero */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturesSection />

      <FeaturedProducts />

      {/* Logos Marquee */}
      <div className="py-12 px-4">
        <MarqueeScroller items={logos1} speed="25s" direction="forwards" itemWidth="120px" />
        <div className="mt-10">
          <MarqueeScroller items={logos2} speed="30s" direction="reverse" itemWidth="120px" />
        </div>
      </div>

      {/* Testimonials */}
      <TestimonialSection />

      {/* Team */}
      <TeamSection />

      {/* Pricing */}
      <PricingSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}