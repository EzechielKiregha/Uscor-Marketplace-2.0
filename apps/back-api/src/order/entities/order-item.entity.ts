import { ObjectType, Field, Float, Int } from '@nestjs/graphql'

@ObjectType()
export class OrderItemEntity {
  @Field()
  id: string

  @Field()
  name: string

  @Field(() => Float)
  price: number

  @Field(() => Int)
  quantity: number

  @Field({ nullable: true })
  mediaUrl?: string
}
