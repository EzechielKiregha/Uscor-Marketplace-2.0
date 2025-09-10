import {
  ObjectType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql'
import { BusinessEntity } from '../../business/entities/business.entity'
import { ClientEntity } from '../../client/entities/client.entity'
import { FreelanceServiceEntity } from '../../freelance-service/entities/freelance-service.entity'
import { PaymentTransactionEntity } from '../../payment-transaction/entities/payment-transaction.entity'
import {
  EscrowStatus,
  FreelanceStatus,
} from '../dto/create-freelance-order.input'

@ObjectType()
export class FreelanceOrderEntity {
  @Field()
  id: string

  @Field()
  serviceId: string

  @Field(() => FreelanceServiceEntity)
  service: FreelanceServiceEntity

  @Field()
  clientId: string

  @Field(() => ClientEntity)
  client: ClientEntity

  @Field(() => Int)
  quantity: number

  @Field(() => Float)
  totalAmount: number

  @Field(() => Float)
  escrowAmount: number

  @Field(() => Float, {
    name: 'platformCommissionPercentage',
  })
  commissionPercent: number

  @Field(() => FreelanceStatus)
  status: FreelanceStatus

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field(() => PaymentTransactionEntity, {
    nullable: true,
    name: 'paymentTransaction',
  })
  payment?: PaymentTransactionEntity
}

@ObjectType()
export class FreelanceOrderBusinessEntity {
  @Field()
  id: string

  @Field(() => BusinessEntity)
  business: BusinessEntity

  @Field({ nullable: true })
  role?: string

  @Field()
  assignedAt: Date
}

@ObjectType()
export class PaginatedFreelanceOrdersResponse {
  @Field(() => [FreelanceOrderEntity])
  items: FreelanceOrderEntity[]

  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number
}
