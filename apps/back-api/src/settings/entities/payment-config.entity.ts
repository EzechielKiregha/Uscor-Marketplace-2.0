import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class PaymentConfigEntity {
  @Field()
  id: string

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

  @Field()
  mobileMoneyEnabled: boolean
}
