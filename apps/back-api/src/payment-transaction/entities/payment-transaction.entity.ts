import {
  ObjectType,
  Field,
  Float,
  registerEnumType,
} from '@nestjs/graphql'
import { OrderEntity } from '../../order/entities/order.entity'

// Enums
enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

enum PaymentMethod {
  TOKEN = 'TOKEN',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

// Register enums with GraphQL
registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
})
registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
})

@ObjectType()
export class PaymentTransactionEntity {
  @Field()
  id: string

  @Field(() => Float)
  amount: number

  @Field()
  method: PaymentMethod

  @Field()
  status: PaymentStatus

  @Field()
  transactionDate: Date

  @Field({ nullable: true })
  qrCode?: string

  @Field()
  createdAt: Date

  // Relations
  @Field(() => OrderEntity) // Order associated with the payment transaction
  order: OrderEntity

  @Field(() => [PostTransactionEntity], {
    nullable: true,
  })
  PostTransaction?: PostTransactionEntity[]
}

@ObjectType()
export class PostTransactionEntity {
  @Field()
  id: string

  @Field(() => Float)
  amount: number

  @Field()
  status: string

  @Field()
  createdAt: Date
}
