import {
  ObjectType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql'
import { ProductEntity } from '../../product/entities/product.entity'
import { ShippingEntity } from './shipping.entity'

@ObjectType()
export class ReOwnedProductEntity {
  @Field()
  id: string

  @Field()
  newProductId: string

  @Field(() => ProductEntity)
  newProduct: ProductEntity

  @Field()
  originalProductId: string

  @Field(() => ProductEntity)
  originalProduct: ProductEntity

  @Field()
  oldOwnerId: string

  @Field()
  newOwnerId: string

  @Field(() => Int)
  quantity: number

  @Field(() => Float)
  oldPrice: number

  @Field(() => Float)
  newPrice: number

  @Field(() => Float)
  markupPercentage: number

  @Field()
  agreedViaChatId: string

  @Field()
  agreementDate: Date

  @Field(() => Boolean)
  isOriginalApproved: boolean

  @Field(() => Boolean)
  isNewOwnerApproved: boolean

  @Field({ nullable: true })
  shippingId?: string

  @Field(() => ShippingEntity, { nullable: true })
  shipping?: ShippingEntity

  @Field()
  createdAt: Date
}
