import {
  ObjectType,
  Field,
  Float,
} from '@nestjs/graphql'
import { BusinessEntity } from '../../business/entities/business.entity'
import { ProductEntity } from '../../product/entities/product.entity'

@ObjectType()
export class RepostedProductEntity {
  @Field()
  id: string

  @Field()
  productId: string

  @Field(() => ProductEntity)
  product: ProductEntity

  @Field()
  businessId: string

  @Field(() => BusinessEntity)
  business: BusinessEntity

  @Field(() => Float)
  markupPercentage: number

  @Field()
  createdAt: Date
}
