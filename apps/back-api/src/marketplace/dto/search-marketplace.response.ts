import { ObjectType, Field } from '@nestjs/graphql'
import { ProductEntity } from '../../product/entities/product.entity'
import { FreelanceServiceEntity } from '../../freelance-service/entities/freelance-service.entity'

@ObjectType()
export class SearchMarketplaceResponse {
  @Field(() => [ProductEntity])
  products: ProductEntity[]

  @Field(() => [FreelanceServiceEntity])
  services: FreelanceServiceEntity[]
}
