import React from 'react'

function ProductHero() {
  return (
    <div className="py-8 mx-auto text-center flex flex-col items-center max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
        Browse Products Categories On Left Panel of{' '}
        <span className="text-primary">Uscor Products List</span>
      </h1>
      <p className="mt-6 text-lg max-w-prose text-muted-foreground">
        Find the perfect product for your needs with Uscor Marketplace.
      </p>
    </div>
  )
}

export default ProductHero