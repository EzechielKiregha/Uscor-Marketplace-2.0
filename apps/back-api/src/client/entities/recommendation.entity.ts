import { ObjectType, Field } from '@nestjs/graphql'
import { BusinessEntity } from '../../business/entities/business.entity'

@ObjectType()
export class RecommendationItem {
  @Field()
  id: string

  @Field()
  name: string

  @Field(() => Number)
  price: number

  @Field({ nullable: true })
  mediaUrl?: string

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity
}

@ObjectType()
export class RecommendationEntity {
  @Field()
  id: string

  @Field({ nullable: true })
  type?: string

  @Field()
  title: string

  @Field({ nullable: true })
  description?: string

  @Field(() => [RecommendationItem], { nullable: true })
  items?: RecommendationItem[]

  @Field({ nullable: true })
  reason?: string

  @Field({ nullable: true })
  createdAt?: Date
}
