import {
  ObjectType,
  Field,
  Int,
  Float,
} from '@nestjs/graphql'

@ObjectType()
export class TopCustomerEntity {
  @Field()
  clientId: string

  @Field()
  clientName: string

  @Field(() => Float)
  totalPoints: number

  @Field(() => Float)
  totalSpent: number
}

@ObjectType()
export class PointsByDayEntity {
  @Field()
  date: string

  @Field(() => Float)
  earned: number

  @Field(() => Float)
  redeemed: number
}

@ObjectType()
export class LoyaltyAnalyticsEntity {
  @Field(() => Int)
  totalMembers: number

  @Field(() => Int)
  activeMembers: number

  @Field(() => Float)
  pointsEarned: number

  @Field(() => Float)
  pointsRedeemed: number

  @Field(() => Float)
  redemptionRate: number

  @Field(() => [TopCustomerEntity])
  topCustomers: TopCustomerEntity[]

  @Field(() => [PointsByDayEntity])
  pointsByDay: PointsByDayEntity[]
}
