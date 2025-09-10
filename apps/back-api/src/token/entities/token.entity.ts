import {
  ObjectType,
  Field,
  Int,
} from '@nestjs/graphql'

@ObjectType()
export class TokenEntity {
  @Field()
  id: string

  @Field({ nullable: true })
  name?: string

  @Field(() => Int)
  value: number

  @Field()
  createdAt: Date
}
