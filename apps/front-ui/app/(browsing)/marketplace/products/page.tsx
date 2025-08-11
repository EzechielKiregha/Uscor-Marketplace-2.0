import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import Footer from '@/components/seraui/FooterSection'
import HeaderComponent from '@/components/seraui/HeaderComponent'
import { PRODUCT_CATEGORIES } from '@/config'
import { GET_PRODUCTS } from '@/graphql/product.gql'
import { useSearchParams } from 'next/navigation'

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
        <ProductReel
          title="Explore Our High-Quality Products"
          href="/marketplace/products"
          query={GET_PRODUCTS}
          limit={20}
        />
      </MaxWidthWrapper>
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ProductsPage
