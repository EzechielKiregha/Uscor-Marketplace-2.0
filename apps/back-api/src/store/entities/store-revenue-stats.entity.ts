import {
  ObjectType,
  Field,
  Int,
} from '@nestjs/graphql'
@ObjectType()
export class RevenueStats {
  @Field(() => Number)
  total: number

  @Field(() => Number)
  monthly: number

  @Field(() => Number)
  weekly: number
}
