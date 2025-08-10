import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import Footer from '@/components/seraui/FooterSection'
import HeaderComponent from '@/components/seraui/HeaderComponent'
import { PRODUCT_CATEGORIES } from '@/config'

type Param = string | string[] | undefined

interface ProductsPageProps {
  searchParams: { [key: string]: Param }
}

const parse = (param: Param) => {
  return typeof param === 'string' ? param : undefined
}

const ProductsPage = ({
  searchParams,
}: ProductsPageProps) => {
  const sort = parse(searchParams.sort)
  const category = parse(searchParams.category)

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === category
  )?.label

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      {/* Header */}
      <HeaderComponent />
      <MaxWidthWrapper>
        <ProductReel
          title={label ?? "Naviguez notre colection de produits de haute qualite"}
          query={{
            category,
            limit: 40,
            sort:
              sort === 'desc' || sort === 'asc'
                ? sort
                : undefined,
          }}
        />
      </MaxWidthWrapper>
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ProductsPage
