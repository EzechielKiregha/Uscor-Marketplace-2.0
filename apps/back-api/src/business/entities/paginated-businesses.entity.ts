import { ObjectType, Field, Int } from '@nestjs/graphql'
import { BusinessEntity } from './business.entity'

@ObjectType()
export class PaginatedBusinesses {
  @Field(() => [BusinessEntity])
  items: BusinessEntity[]

  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number
}
