// 'use client'

// import { useEffect, useState } from 'react'
// import { Button, buttonVariants } from './ui/button'
// import { useCart } from '@/hooks/use-cart'
// import { Product } from '@/payload-types'

// const AddToCartButton = ({
//   product,
// }: {
//   product: Product
// }) => {
//   const { addItem } = useCart()
//   const [isSuccess, setIsSuccess] = useState<boolean>(false)

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setIsSuccess(false)
//     }, 2000)

//     return () => clearTimeout(timeout)
//   }, [isSuccess])

//   return (
//     <Button
//       onClick={() => {
//         addItem(product)
//         setIsSuccess(true)
//       }}
//       className={buttonVariants({
//         className: 'bg-blue-800 hover:bg-blue-100  text-white w-full'
//       })}
//       size='lg'>
//       {isSuccess ? "C'est fait!!" : 'Ajoute au panier'}
//     </Button>
//   )
// }

// export default AddToCartButton
