import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class BusinessTypeEntity {
  @Field()
  id: string

  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  icon?: string
}
