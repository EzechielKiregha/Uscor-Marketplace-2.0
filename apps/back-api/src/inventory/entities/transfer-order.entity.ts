import {
  ObjectType,
  Field,
  Int,
} from '@nestjs/graphql'
import { TransferOrderStatus } from '../../generated/prisma/enums'
import { StoreEntity } from '../../store/entities/store.entity'
import { TransferOrderProductEntity } from './transfer-order-product.entity'

@ObjectType()
export class TransferOrderEntity {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: true })
  fromStoreId?: string

  @Field(() => StoreEntity, { nullable: true })
  fromStore?: StoreEntity

  @Field({ nullable: true })
  toStoreId?: string

  @Field(() => StoreEntity, { nullable: true })
  toStore?: StoreEntity

  @Field(() => TransferOrderStatus, {
    nullable: true,
  })
  status?: TransferOrderStatus

  @Field({ nullable: true })
  createdAt?: Date

  @Field({ nullable: true })
  updatedAt?: Date

  @Field(() => [TransferOrderProductEntity], {
    nullable: true,
  })
  products?: TransferOrderProductEntity[]
}

@ObjectType()
export class PaginatedTransferOrderResponse {
  @Field(() => [TransferOrderEntity])
  items: TransferOrderEntity[]

  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number
}
