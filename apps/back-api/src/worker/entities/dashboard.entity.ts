import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { ClientEntity } from "../../client/entities/client.entity";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class WorkerPerformanceEntity {
	@Field({ nullable: true })
	@IsOptional()
	totalSales: number;

	@Field({ nullable: true })
	@IsOptional()
	totalTransactions: number;

	@Field({ nullable: true })
	@IsOptional()
	customerSatisfaction: number;

	@Field({ nullable: true })
	@IsOptional()
	attendanceRate: number;

	@Field({ nullable: true })
	@IsOptional()
	shiftsCompleted: number;

	@Field({ nullable: true })
	@IsOptional()
	personalSales: number;
}

@ObjectType()
export class TopSellingProductEntity {
	@Field({ nullable: true })
	@IsOptional()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	title: string;

	@Field({ nullable: true })
	@IsOptional()
	quantitySold: number;

	@Field({ nullable: true })
	@IsOptional()
	revenue: number;

    @Field(() => ProductEntity, { nullable: true})
      product?: ProductEntity;
}

@ObjectType()
export class RecentOrderEntity {
	@Field({ nullable: true })
	@IsOptional()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	orderNumber: string;

	@Field({ nullable: true })
	@IsOptional()
	totalAmount: number;

	@Field({ nullable: true })
	@IsOptional()
	status: string;

	@Field(() => ClientEntity, { nullable: true })
	@IsOptional()
	client: ClientEntity;

	@Field({ nullable: true })
	@IsOptional()
	createdAt: Date;
}

@ObjectType()
export class CurrentShiftEntity {
	@Field({ nullable: true })
	@IsOptional()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	startTime: Date;

	@Field({ nullable: true })
	@IsOptional()
	sales?: number;

	@Field({ nullable: true })
	@IsOptional()
	transactions?: number;
}

@ObjectType()
export class WorkerDashboardEntity {
	@Field({ nullable: true })
	@IsOptional()
	todaySales: number;

	@Field({ nullable: true })
	@IsOptional()
	todayOrders: number;

	@Field({ nullable: true })
	@IsOptional()
	lowStockItems: number;

	@Field({ nullable: true })
	@IsOptional()
	activeChats: number;

	@Field(() => CurrentShiftEntity, {
		nullable: true,
	})
	@IsOptional()
	currentShift?: CurrentShiftEntity;

	@Field({ nullable: true })
	@IsOptional()
	salesThisWeek: number;

	@Field({ nullable: true })
	@IsOptional()
	salesThisMonth: number;

	@Field(() => [TopSellingProductEntity], {
		nullable: true,
	})
	@IsOptional()
	topSellingProducts?: TopSellingProductEntity[];

	@Field(() => [RecentOrderEntity], {
		nullable: true,
	})
	@IsOptional()
	recentOrders?: RecentOrderEntity[];

	@Field(() => WorkerPerformanceEntity, {
		nullable: true,
	})
	@IsOptional()
	workerPerformance?: WorkerPerformanceEntity;
}

@ObjectType()
export class WorkerDashboardStatsEntity {
	@Field({ nullable: true })
	@IsOptional()
	todaySales: number;

	@Field({ nullable: true })
	@IsOptional()
	todayTransactions: number;

	@Field({ nullable: true })
	@IsOptional()
	currentShiftSales: number;

	@Field({ nullable: true })
	@IsOptional()
	currentShiftDuration: number;

	@Field({ nullable: true })
	@IsOptional()
	lowStockProducts: number;

	@Field({ nullable: true })
	@IsOptional()
	upcomingChats: number;
}

@ObjectType()
export class MobileMoneyPaymentResponseEntity {
	@Field({ nullable: true })
	@IsOptional()
	success: boolean;

	@Field({ nullable: true })
	@IsOptional()
	transactionId: string;

	@Field({ nullable: true })
	@IsOptional()
	status: string;

	@Field({ nullable: true })
	@IsOptional()
	ussdCode?: string;
}
