import { InputType, Field } from '@nestjs/graphql'
import { PaymentMethod } from '../../payment-transaction/dto/create-payment-transaction.input'

@InputType()
export class PaymentMethodInput {
  @Field(() => String)
  type: PaymentMethod

  @Field({ nullable: true })
  last4?: string

  @Field({ nullable: true })
  isDefault?: boolean
}
