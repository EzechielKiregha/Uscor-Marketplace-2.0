import { ObjectType, Field, Int } from '@nestjs/graphql'
import { ProductEntity } from '../../product/entities/product.entity'

@ObjectType()
export class PaginatedProductsResponse {
  @Field(() => [ProductEntity])
  items: ProductEntity[]

  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number
}
