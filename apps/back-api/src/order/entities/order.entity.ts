import {
  ObjectType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql'
import { ClientEntity } from '../../client/entities/client.entity'
import { OrderProductEntity } from '../../order-product/entities/order-product.entity'
import { PaymentTransactionEntity } from '../../payment-transaction/entities/payment-transaction.entity'

@ObjectType()
export class OrderEntity {
  @Field()
  id: string

  @Field(() => Float)
  deliveryFee: number

  @Field({ nullable: true })
  deliveryAddress?: string

  @Field({ nullable: true })
  qrCode?: string

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field()
  clientId: string

  @Field(() => ClientEntity)
  client: ClientEntity

  @Field(() => PaymentTransactionEntity, {
    nullable: true,
  })
  payment?: PaymentTransactionEntity

  @Field(() => [OrderProductEntity], {
    nullable: true,
  })
  products?: OrderProductEntity[]

  @Field({ nullable: true })
  status?: string

  @Field(() => Float, { nullable: true })
  totalAmount?: number
}

@ObjectType()
export class PaginatedOrdersResponse {
  @Field(() => [OrderEntity])
  items: OrderEntity[]

  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number
}
