import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class DeliveryAddressEntity {
  @Field({ nullable: true })
  street?: string

  @Field({ nullable: true })
  city?: string
}
