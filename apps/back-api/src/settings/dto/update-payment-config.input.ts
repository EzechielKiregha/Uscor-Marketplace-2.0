import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class UpdatePaymentConfigInput {
  @Field({ nullable: true })
  mtnCode?: string

  @Field({ nullable: true })
  airtelCode?: string

  @Field({ nullable: true })
  orangeCode?: string

  @Field({ nullable: true })
  mpesaCode?: string

  @Field({ nullable: true })
  bankAccount?: string

  @Field({ nullable: true })
  mobileMoneyEnabled?: boolean
}
