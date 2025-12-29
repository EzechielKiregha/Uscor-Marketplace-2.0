import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class AddressEntity {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: true })
  street?: string

  @Field({ nullable: true })
  city?: string

  @Field({ nullable: true })
  country?: string

  @Field({ nullable: true })
  postalCode?: string

  @Field({ nullable: true })
  isDefault?: boolean

  @Field({ nullable: true })
  createdAt?: Date

  @Field({ nullable: true })
  updatedAt?: Date
}
