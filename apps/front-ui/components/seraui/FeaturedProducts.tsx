'use client';

import { useEffect, useState } from 'react';

// Your GraphQL client
import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import MasonryGrid from './MasonryGrid';
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await client.query({ query: GET_FEATURED_PRODUCTS });
        const formatted = data.products.map((product: any) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: product.quantity,
          href: `/products/${product.id}`,
          imageUrl: product.imageUrl || `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`,
        }));
        setProducts(formatted);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    }
    loadProducts();
  }, []);

  const handleLike = (id: string | number) => {
    console.log('Liked product:', id);
    // Add to wishlist, etc.
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground mb-8">Featured Products</h2>
      <MasonryGrid products={products} onLike={handleLike} />
    </section>
  );
}