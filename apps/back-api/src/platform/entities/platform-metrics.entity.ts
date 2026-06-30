import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DailyCount {
	@Field() date: string;
	@Field(() => Int) count: number;
}

@ObjectType()
export class DailyAmount {
	@Field() date: string;
	@Field(() => Float) amount: number;
}

@ObjectType()
export class BusinessTypeCount {
	@Field() type: string;
	@Field(() => Int) count: number;
}

@ObjectType()
export class PlatformMetrics {
	@Field(() => Int) totalUsers: number;
	@Field(() => Int) totalBusinesses: number;
	@Field(() => Int) totalProducts: number;
	@Field(() => Int) totalServices: number;
	@Field(() => Int) totalTransactions: number;
	@Field(() => Float) totalRevenue: number;
	@Field(() => Int) activeUsersToday: number;
	@Field(() => Int) activeBusinessesToday: number;
	@Field(() => Float)
	averageTransactionValue: number;
	@Field(() => Float)
	platformFeesCollected: number;
	@Field(() => Int) kycPendingCount: number;
	@Field(() => Int) kycVerifiedCount: number;
	@Field(() => Int) kycRejectedCount: number;
	@Field(() => Int) disputesOpenCount: number;
	@Field(() => Int) disputesResolvedCount: number;
	@Field(() => Int) adsActiveCount: number;
	@Field(() => Int) adsPendingCount: number;
	@Field(() => [DailyCount])
	last24Hours: DailyCount[];
	@Field(() => [DailyCount])
	last7Days: DailyCount[];
	@Field(() => [DailyCount])
	last30Days: DailyCount[];

	// ─── Phase 15 additions ─────────────────────────────────
	@Field(() => Int) totalWorkers: number;
	@Field(() => Int) totalStores: number;
	@Field(() => Int) totalOrders: number;
	@Field(() => Float) totalTokenVolume: number;
	@Field(() => Float) totalRechargeVolume: number;
	@Field(() => Int) totalSales: number;
	@Field(() => Float) totalSalesRevenue: number;
	@Field(() => Int) activeWorkersToday: number;

	// Growth metrics (signup trends — last 30 days)
	@Field(() => [DailyCount]) userSignups30d: DailyCount[];
	@Field(() => [DailyCount]) businessSignups30d: DailyCount[];

	// GMV (Gross Merchandise Volume) — last 30 days daily
	@Field(() => [DailyAmount]) gmv30d: DailyAmount[];

	// Business type distribution
	@Field(() => [BusinessTypeCount]) businessTypeDistribution: BusinessTypeCount[];
}
