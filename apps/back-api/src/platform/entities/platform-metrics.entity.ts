import { ObjectType, Field, Int, Float } from '@nestjs/graphql'

@ObjectType()
export class DailyCount {
  @Field() date: string
  @Field(() => Int) count: number
}

@ObjectType()
export class PlatformMetrics {
  @Field(() => Int) totalUsers: number
  @Field(() => Int) totalBusinesses: number
  @Field(() => Int) totalProducts: number
  @Field(() => Int) totalServices: number
  @Field(() => Int) totalTransactions: number
  @Field(() => Float) totalRevenue: number
  @Field(() => Int) activeUsersToday: number
  @Field(() => Int) activeBusinessesToday: number
  @Field(() => Float) averageTransactionValue: number
  @Field(() => Float) platformFeesCollected: number
  @Field(() => Int) kycPendingCount: number
  @Field(() => Int) kycVerifiedCount: number
  @Field(() => Int) kycRejectedCount: number
  @Field(() => Int) disputesOpenCount: number
  @Field(() => Int) disputesResolvedCount: number
  @Field(() => Int) adsActiveCount: number
  @Field(() => Int) adsPendingCount: number
  @Field(() => [DailyCount]) last24Hours: DailyCount[]
  @Field(() => [DailyCount]) last7Days: DailyCount[]
  @Field(() => [DailyCount]) last30Days: DailyCount[]
}