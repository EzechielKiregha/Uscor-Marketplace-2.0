'use client'

import { TQueryValidator } from '@/lib/validators/query-validator'
// import { trpc } from '@/trpc/client'
import Link from 'next/link'
import ProductListing from './ProductListing'
import { ProductEntity } from '@/lib/types'
// Your GraphQL client
import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { useEffect, useState } from 'react'
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
interface ProductReelProps {
  title: string
  subtitle?: string
  href?: string
  query: TQueryValidator
}

const FALLBACK_LIMIT = 4

const ProductReel = (props: ProductReelProps) => {
  const { title, subtitle, href, query } = props

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

  let map: (ProductEntity | null)[] = []
  if (products && products.length) {
    map = products
  } else if (!products) {
    map = new Array<null>(
      query.limit ?? FALLBACK_LIMIT
    ).fill(null)
  }

  return (
    <section className='py-30'>
      <div className='md:flex md:items-center md:justify-between mb-4'>
        <div className='max-w-2xl px-4 lg:max-w-4xl lg:px-0'>
          {title ? (
            <h1 className='text-2xl font-bold dark:text-gray-200 text-gray-900 sm:text-3xl'>
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className='mt-2 text-sm text-muted-foreground'>
              {subtitle}
            </p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className='hidden text-sm font-medium underline dark:text-gray-400 text-sky-700 hover:text-blue-800 md:block'>
            Voir plus dans une collection{' '}
            <span aria-hidden='true'>&rarr;</span>
          </Link>
        ) : null}
      </div>

      <div className='relative'>
        <div className='mt-6 flex items-center w-full'>
          <div className='w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8'>
            {map.map((product, i) => (
              <ProductListing
                key={`product-${i}`}
                product={product}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductReel
