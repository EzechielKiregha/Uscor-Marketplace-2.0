import {
  ObjectType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql'
import { ClientEntity } from '../../client/entities/client.entity'
import { OrderProductEntity } from '../../order-product/entities/order-product.entity'
import { PaymentTransactionEntity } from '../../payment-transaction/entities/payment-transaction.entity'
import { BusinessEntity } from '../../business/entities/business.entity'
import { StoreEntity } from '../../store/entities/store.entity'
import { OrderItemEntity } from './order-item.entity'
import { DeliveryAddressEntity } from './delivery-address.entity'
import { PaymentMethodEntity } from '../../client/entities/payment-method.entity'

@ObjectType()
export class OrderEntity {
  @Field()
  id: string

  @Field(() => Float)
  deliveryFee: number

  // deliveryAddress will be returned as an object with { street, city }
  @Field(() => DeliveryAddressEntity, { nullable: true })
  deliveryAddress?: DeliveryAddressEntity

  @Field({ nullable: true })
  qrCode?: string

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field({ nullable: true })
  clientId?: string

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

  // For front-end compatibility
  @Field({ nullable: true })
  orderNumber?: string

  @Field({ nullable: true })
  status?: string

  @Field(() => [OrderItemEntity], { nullable: true })
  items?: OrderItemEntity[]

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity

  @Field(() => StoreEntity, { nullable: true })
  store?: StoreEntity

  @Field(() => PaymentMethodEntity, { nullable: true })
  paymentMethod?: PaymentMethodEntity

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
