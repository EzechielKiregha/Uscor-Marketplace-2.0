'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from './ui/skeleton'
import Link from 'next/link'
import { cn, formatPrice } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/config'
import ImageSlider from './ImageSlider'
import { useNavigation } from '@/hooks/useNavigation'
import { ProductEntity } from '@/lib/types'

interface ProductListingProps {
  product: ProductEntity | null
  index: number
}

const ProductListing = ({
  product,
  index,
}: ProductListingProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const nav = useNavigation()
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 150)

    return () => clearTimeout(timer)
  }, [index])

  if (!product || !isVisible) return <ProductPlaceholder />

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category?.name
  )?.label

  const validUrls = product.medias
    .map(({ url }) =>
      typeof url === 'string' ? url : ""
    )
    .filter(Boolean) as string[]

  if (isVisible && product) {
    return (
      <Link
        className={cn(
          'invisible h-full w-full cursor-pointer group/main',
          {
            'visible animate-in fade-in-5': isVisible,
          }
        )}
        // onClick={() => nav()}
        href={`/product/${product.id}`}>
        <div className='flex flex-col w-full'>
          <ImageSlider urls={validUrls} />

          <h3 onClick={() => nav()} className='mt-4 font-medium text-sm text-gray-700'>
            {product.title}
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            {label}
          </p>
          <p className='mt-1 font-medium text-sm text-gray-900'>
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    )
  }
}

const ProductPlaceholder = () => {
  return (
    <div className='flex flex-col w-full'>
      <div className='relative bg-zinc-100 aspect-square w-full overflow-hidden rounded-xl'>
        <Skeleton className='h-full w-full' />
      </div>
      <Skeleton className='mt-4 w-2/3 h-4 rounded-lg' />
      <Skeleton className='mt-2 w-16 h-4 rounded-lg' />
      <Skeleton className='mt-2 w-12 h-4 rounded-lg' />
    </div>
  )
}

export default ProductListing
