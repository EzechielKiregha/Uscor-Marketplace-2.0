import { ObjectType, Field } from '@nestjs/graphql'
import { PaymentMethod } from '../../payment-transaction/dto/create-payment-transaction.input'

@ObjectType()
export class PaymentMethodEntity {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: true })
  type?: PaymentMethod

  @Field({ nullable: true })
  last4?: string

  @Field({ nullable: true })
  isDefault?: boolean

  @Field({ nullable: true })
  createdAt?: Date

  @Field({ nullable: true })
  updatedAt?: Date
}
