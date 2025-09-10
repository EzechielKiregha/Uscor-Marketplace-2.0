'use client'

import { useEffect, useState } from 'react'
import { Button, buttonVariants } from './ui/button'
import { useCart } from '@/hooks/use-cart'
import { ProductEntity } from '@/lib/types'

const AddToCartButton = ({
  product,
}: {
  product: ProductEntity
}) => {
  const { addItem } = useCart()
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSuccess(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [isSuccess])

  return (
    <Button
      onClick={() => {
        addItem(product)
        setIsSuccess(true)
      }}
      className={buttonVariants({
        className: 'bg-primary hover:bg-primary/90  text-white w-full cursor-pointer'
      })}
      size='lg'>
      {isSuccess ? "Done" : 'Add to Cart'}
    </Button>
  )
}

export default AddToCartButton
