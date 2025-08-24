"use client"
import CategoryScrollArea from '@/components/CategoryScrollArea'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import Footer from '@/components/seraui/FooterSection'
import HeaderComponent from '@/components/seraui/HeaderComponent'
import { PRODUCT_CATEGORIES } from '@/config/product-categories'
import { GET_PRODUCTS } from '@/graphql/product.gql'
import { useSearchParams } from 'next/navigation'
import ProductHero from '../../freelance-gigs/_components/ProductHero'

function ProductsPage() {
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort') ?? undefined;
  const category = searchParams.get('category') ?? undefined;

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === category
  )?.label;

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      {/* Header */}
      <HeaderComponent />
      <MaxWidthWrapper>
        <ProductHero />
        <div className="flex">
          {/* Sidebar: Category Scroll Area */}
          <CategoryScrollArea type="products" />

          {/* Main: Service List */}
          <div className="flex-1 min-w-0">
            <ProductReel
              title="Explore Our High-Quality Products"
              href="/marketplace/products"
              query={GET_PRODUCTS}
              limit={20}
            />
          </div>
        </div>

      </MaxWidthWrapper>
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ProductsPage
