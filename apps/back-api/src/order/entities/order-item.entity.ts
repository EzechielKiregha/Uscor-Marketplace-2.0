import { ObjectType, Field, Float, Int } from '@nestjs/graphql'
import { MediaEntity } from '../../media/entities/media.entity'

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

  @Field(() => [MediaEntity], { nullable: true })
  media: MediaEntity[]
}
