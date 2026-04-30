import { Field, ObjectType } from "@nestjs/graphql";
import { ClientEntity } from "src/client/entities/client.entity";

@ObjectType()
export class WorkerPerformanceEntity {
	@Field()
	totalSales: number;

	@Field()
	totalTransactions: number;

	@Field()
	customerSatisfaction: number;

	@Field()
	attendanceRate: number;

	@Field()
	shiftsCompleted: number;

	@Field()
	personalSales: number;
}

@ObjectType()
export class TopSellingProductEntity {
	@Field()
	id: string;

	@Field()
	title: string;

	@Field()
	quantitySold: number;

	@Field()
	revenue: number;
}

@ObjectType()
export class RecentOrderEntity {
	@Field()
	id: string;

	@Field()
	orderNumber: string;

	@Field()
	totalAmount: number;

	@Field()
	status: string;

	@Field(() => ClientEntity)
	client: ClientEntity;

	@Field()
	createdAt: Date;
}

@ObjectType()
export class CurrentShiftEntity {
	@Field()
	id: string;

	@Field()
	startTime: Date;

	@Field({ nullable: true })
	sales?: number;

	@Field({ nullable: true })
	transactions?: number;
}

@ObjectType()
export class WorkerDashboardEntity {
	@Field()
	todaySales: number;

	@Field()
	todayOrders: number;

	@Field()
	lowStockItems: number;

	@Field()
	activeChats: number;

	@Field(() => CurrentShiftEntity, {
		nullable: true,
	})
	currentShift?: CurrentShiftEntity;

	@Field()
	salesThisWeek: number;

	@Field()
	salesThisMonth: number;

	@Field(() => [TopSellingProductEntity], {
		nullable: true,
	})
	topSellingProducts?: TopSellingProductEntity[];

	@Field(() => [RecentOrderEntity], {
		nullable: true,
	})
	recentOrders?: RecentOrderEntity[];

	@Field(() => WorkerPerformanceEntity, {
		nullable: true,
	})
	workerPerformance?: WorkerPerformanceEntity;
}

@ObjectType()
export class WorkerDashboardStatsEntity {
	@Field()
	todaySales: number;

	@Field()
	todayTransactions: number;

	@Field()
	currentShiftSales: number;

	@Field()
	currentShiftDuration: number;

	@Field()
	lowStockProducts: number;

	@Field()
	upcomingChats: number;
}

@ObjectType()
export class MobileMoneyPaymentResponseEntity {
	@Field()
	success: boolean;

	@Field()
	transactionId: string;

	@Field()
	status: string;

	@Field({ nullable: true })
	ussdCode?: string;
}
