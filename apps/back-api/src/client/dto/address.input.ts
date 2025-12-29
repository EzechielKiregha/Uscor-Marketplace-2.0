import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class AddressInput {
  @Field()
  street: string

  @Field()
  city: string

  @Field({ nullable: true })
  country?: string

  @Field({ nullable: true })
  postalCode?: string

  @Field({ nullable: true })
  isDefault?: boolean
}
