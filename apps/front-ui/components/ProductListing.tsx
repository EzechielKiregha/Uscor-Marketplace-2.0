'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from './ui/skeleton'
import Link from 'next/link'
import { cn, formatPrice } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/config/product-categories'
import ImageSlider from './ImageSlider'
import { useNavigation } from '@/hooks/useNavigation'
import { ProductEntity } from '@/lib/types'

interface ProductListingProps {
  product: ProductEntity | null
  index: number
  isLoading?: boolean
}

const ProductListing = ({ product, index, isLoading }: ProductListingProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const nav = useNavigation()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150)
    return () => clearTimeout(timer)
  }, [index])

  if (!product || !isVisible || isLoading) return <ProductPlaceholder />

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category?.name
  )?.label

  // --- Image URLs logic ---
  let validUrls = []
  if (!product.medias || product.medias.length === 0) {
    validUrls = [
      `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`
    ]
  }

  validUrls = product.medias
    .map(({ url }) => (typeof url === 'string' ? url : `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`))
    .filter(Boolean) as string[]

  // --- Description logic ---
  const words = product.description?.split(/\s+/) || []
  const isLong = words.length > 10
  const truncatedDescription = isLong
    ? words.slice(0, 20).join(' ') + '...'
    : product.description

  return (
    <Link
      className={cn('invisible h-full w-full cursor-pointer group/main', {
        'visible animate-in fade-in-5': isVisible,
      })}
      href={`/marketplace/products/${product.id}`}
    >
      <div className="flex flex-col w-full">
        {/* Images */}
        <ImageSlider urls={validUrls} />

        {/* Product title */}
        <h3 className="mt-4 font-medium text-sm dark:text-gray-300 text-gray-950 hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Business info */}
        {product.business && (
          <div className="flex items-center mt-1 space-x-2">
            {/* <Image
                src={product.business.avatar || `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.business.name)}`}
                alt={product.business.name}
                width={20}
                height={20}
                className="rounded-full"
              /> */}
            <img
              src={product.business.avatar || `https://placehold.co/300x300/E2E8F0/333333?text=${encodeURIComponent(product.business.name)}`}
              alt={product.business.name}
              className="w-20 h-20 object-cover rounded-full transition-transform duration-500 hover:scale-105"
            />
            <span className="text-xs text-gray-800 dark:text-gray-200">{product.business.name}</span>
          </div>
        )}

        {/* Category */}
        <p className="mt-1 text-sm text-gray-500">{product.category?.name}</p>

        {/* Price */}
        <p className="mt-1 font-bold text-sx text-primary">
          {formatPrice(product.price)}
        </p>

        {/* Description with Read More */}
        {product.description && (
          <p className="mt-2 text-xs text-gray-800 dark:text-gray-200">
            {showFullDescription ? product.description : truncatedDescription}{' '}
            {isLong && (
              <button
                type="button"
                className="text-primary underline ml-1"
                onClick={(e) => {
                  e.preventDefault()
                  setShowFullDescription((prev) => !prev)
                }}
              >
                {showFullDescription ? 'Read less' : 'Read more'}
              </button>
            )}
          </p>
        )}
      </div>
    </Link>
  )
}

const ProductPlaceholder = () => (
  <div className="flex flex-col w-full">
    <div className="relative bg-zinc-100 aspect-square w-full overflow-hidden rounded-xl">
      <Skeleton className="h-full w-full" />
    </div>
    <Skeleton className="mt-4 w-2/3 h-4 rounded-lg" />
    <Skeleton className="mt-2 w-16 h-4 rounded-lg" />
    <Skeleton className="mt-2 w-12 h-4 rounded-lg" />
  </div>
)

export default ProductListing
