'use client'
import { PRODUCT_CATEGORIES } from '@/config/product-categories'
import { useCart } from '@/hooks/use-cart'
import { ProductEntity } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const CartItem = ({ product }: { product: ProductEntity }) => {

  const { removeItem } = useCart()

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category?.name
  )?.label

  return (
    <div className='space-y-3 py-2'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center space-x-4'>
          <div className='relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded'>

            <img
              src={(product.medias && product.medias[0].url !== undefined) ? product.medias[0].url : "prod.png"}
              alt={product.title}
              className="hidden absolute object-cover h-4 w-4 text-muted-foreground transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`
              }
              }
            />
          </div>

          <div className='flex flex-col self-start'>
            <span className='line-clamp-1 text-sm font-medium mb-1'>
              {product.title}
            </span>

            <span className='line-clamp-1 text-xs capitalize text-muted-foreground'>
              {label}
            </span>

            <div className='mt-4 text-xs text-muted-foreground'>
              <button
                onClick={() => removeItem(product.id)}
                className='flex items-center gap-0.5'>
                <X className='w-3 h-4' />
                delete
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-1 font-medium'>
          <span className='ml-auto line-clamp-1 text-sm'>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CartItem
