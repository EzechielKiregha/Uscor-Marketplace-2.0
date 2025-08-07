"use client"
import FooterSection from '@/components/seraui/FooterSection';
import HeroSection from '@/components/seraui/HeroSection';
import MarqueeScroller from '@/components/seraui/MarqueeScroller';
import MasonryGrid from '@/components/seraui/MasonryGrid';
import PricingSection from '@/components/seraui/PricingSection';
import TeamSection from '@/components/seraui/TeamMemberCard';
import TestimonialSection from '@/components/seraui/TestimonialSection';
import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';

// Sample logos for MarqueeScroller (replace with actual store/partner logos)
const logos = [
  { id: 1, component: <svg className="w-full h-full" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="var(--primary)" /></svg> },
  { id: 2, component: <svg className="w-full h-full" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="var(--accent)" /></svg> },
  { id: 3, component: <svg className="w-full h-full" viewBox="0 0 100 100"><path d="M20 80 L50 20 L80 80 Z" fill="var(--primary)" /></svg> },
  { id: 4, component: <svg className="w-full h-full" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="var(--accent)" /></svg> },
];

// GraphQL query for featured products
const GET_FEATURED_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      title
      price
      quantity
      business {
        id
        name
      }
      category {
        id
        name
      }
    }
  }
`;


export default async function Home() {
  const { data } = await client.query({
    query: GET_FEATURED_PRODUCTS
  });
  const products = data.products.map((product: any) => ({
    id: product.id,
    imageUrl: product.imageUrl || `https://placehold.co/400x300/[var(--accent)]/FFFFFF?text=${encodeURIComponent(product.title)}`,
    title: product.title,
    price: product.price,
    quantity: product.quantity,
    href: `/products/${product.id}`,
  }));

  return (
    <div className="font-inter bg-[var(--secondary-light)] dark:bg-[var(--secondary-dark)] min-h-screen">
      <HeroSection
        title="Discover Uscor Marketplace"
        subtitle="Shop, sell, and grow with our all-in-one platform for clients, businesses, and freelancers."
        ctaPrimaryText="Browse Products"
        ctaPrimaryLink="/products"
        ctaSecondaryText="Join Now"
        ctaSecondaryLink="/signup"
      />
      <MarqueeScroller logos={logos} speed="20s" itemWidth="150px" itemGap="30px" className="py-8" />
      <MasonryGrid
        items={products}
        onItemClick={(id) => useRouter().push(`/products/${id}`)}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
      />
      <TeamSection
        title="Meet the Uscor Team"
        subtitle="Our dedicated professionals drive innovation for a seamless marketplace experience."
        teamMembers={[
          {
            name: 'Nazmul Hossain',
            role: 'Founder & CEO',
            imageUrl: 'https://i.postimg.cc/W1rCvYnT/nazmul-hossain.jpg',
            socialLinks: [
              { platform: 'twitter', href: 'https://twitter.com/nazmul' },
              { platform: 'instagram', href: 'https://instagram.com/nazmul' },
              { platform: 'facebook', href: 'https://facebook.com/nazmul' },
            ],
          },
          {
            name: 'Emily Jonson',
            role: 'CEO',
            imageUrl: 'https://i.pinimg.com/736x/8c/6d/db/8c6ddb5fe6600fcc4b183cb2ee228eb7.jpg',
            socialLinks: [
              { platform: 'twitter', href: 'https://twitter.com/emilyj' },
              { platform: 'instagram', href: 'https://instagram.com/emilyj' },
              { platform: 'facebook', href: 'https://facebook.com/emilyj' },
            ],
          },
          {
            name: 'Sophia Monic',
            role: 'Product Manager',
            imageUrl: 'https://i.pinimg.com/736x/81/d6/b1/81d6b158728f5fc97ca6e0a025fefee0.jpg',
            socialLinks: [
              { platform: 'twitter', href: 'https://twitter.com/sophiam' },
              { platform: 'instagram', href: 'https://instagram.com/sophiam' },
              { platform: 'facebook', href: 'https://facebook.com/sophiam' },
            ],
          },
          {
            name: 'Olivia Chen',
            role: 'Lead Developer',
            imageUrl: 'https://i.pinimg.com/736x/57/3c/80/573c80967c9429d0ed0ce32701f85b70.jpg',
            socialLinks: [
              { platform: 'twitter', href: 'https://twitter.com/oliviac' },
              { platform: 'instagram', href: 'https://instagram.com/oliviac' },
              { platform: 'facebook', href: 'https://facebook.com/oliviac' },
            ],
          },
        ]}
      />
      <TestimonialSection
        title="What Our Users Say"
        subtitle="Join thousands of happy customers using Uscor Marketplace."
        testimonials={[
          {
            quote: 'Uscor transformed how I shop online. The loyalty program is a game-changer!',
            author: 'Jane Doe',
            role: 'Customer',
            avatar: 'https://i.pravatar.cc/150?img=1',
            avatarFallback: 'https://placehold.co/48x48/[var(--accent)]/FFFFFF?text=JD',
          },
          {
            quote: 'Managing my store’s inventory and sales has never been easier with Uscor’s I-POS.',
            author: 'John Smith',
            role: 'Business Owner',
            avatar: 'https://i.pravatar.cc/150?img=2',
            avatarFallback: 'https://placehold.co/48x48/[var(--accent)]/FFFFFF?text=JS',
          },
          {
            quote: 'As a freelancer, listing my services on Uscor is seamless and effective.',
            author: 'Alice Brown',
            role: 'Freelancer',
            avatar: 'https://i.pravatar.cc/150?img=3',
            avatarFallback: 'https://placehold.co/40x40/[var(--accent)]/FFFFFF?text=AB',
          },
          {
            quote: 'The platform’s tools make running my multi-store business a breeze.',
            author: 'Mike Wilson',
            role: 'Retailer',
            avatar: 'https://i.pravatar.cc/150?img=4',
            avatarFallback: 'https://placehold.co/40x40/[var(--accent)]/FFFFFF?text=MW',
          },
        ]}
      />
      <PricingSection
        title="Choose Your Plan"
        subtitle="Unlock the full potential of Uscor for clients and businesses."
      />
      <FooterSection />
    </div>
  );
}
