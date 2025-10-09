import { ObjectType, Field, Int } from '@nestjs/graphql'
import { ReviewEntity } from '../../review/entities/review.entity'

@ObjectType()
export class PaginatedReviews {
  @Field(() => [ReviewEntity])
  items: ReviewEntity[]

  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number
}
