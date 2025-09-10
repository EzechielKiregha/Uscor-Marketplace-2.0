import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql'
import { WorkerEntity } from '../../worker/entities/worker.entity'
import { ClientEntity } from '../../client/entities/client.entity'
import { PaymentMethod } from '../../payment-transaction/dto/create-payment-transaction.input'
import { SaleStatus } from '../../generated/prisma/enums'
import { SaleProductEntity } from './sale-product.entity'
import { ReturnEntity } from './return.entity'
import { StoreEntity } from '../../store/entities/store.entity'

// Enums
registerEnumType(SaleStatus, {
  name: 'SaleStatus',
})

@ObjectType()
export class SaleEntity {
  @Field({ nullable: true })
  id?: string

  @Field({nullable: true })
  storeId?: string

  @Field(() => StoreEntity, {nullable: true })
  store?: StoreEntity

  @Field({nullable: true })
  workerId?: string

  @Field(() => WorkerEntity, {nullable: true })
  worker?: WorkerEntity

  @Field({ nullable: true })
  clientId?: string

  @Field(() => ClientEntity, { nullable: true })
  client?: ClientEntity

  @Field(() => Float, { nullable: true })
  totalAmount?: number

  @Field(() => Float, { nullable: true })
  discount?: number

  @Field(() => PaymentMethod, {nullable: true })
  paymentMethod?: PaymentMethod

  @Field(() => SaleStatus, {nullable: true })
  status?: SaleStatus

  @Field({ nullable: true })
  createdAt?: Date

  @Field({ nullable: true })
  updatedAt?: Date

  @Field(() => [SaleProductEntity], {nullable: true })
  saleProducts?: SaleProductEntity[]

  @Field(() => [ReturnEntity], {nullable: true })
  returns?: ReturnEntity[]
}
