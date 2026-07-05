import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { ClientEntity } from "../../client/entities/client.entity";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class WorkerSalesHourPointEntity {
	@Field({ nullable: true })
	@IsOptional()
	hour: string;

	@Field({ nullable: true })
	@IsOptional()
	sales: number;
}

@ObjectType()
export class WorkerCategorySalesEntity {
	@Field({ nullable: true })
	@IsOptional()
	category: string;

	@Field({ nullable: true })
	@IsOptional()
	sales: number;

	@Field({ nullable: true })
	@IsOptional()
	quantity: number;
}

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
	totalRevenue: number;

	@Field({ nullable: true })
	@IsOptional()
	averageTicket: number;

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

	@Field(() => [WorkerSalesHourPointEntity], { nullable: true })
	@IsOptional()
	salesByHour?: WorkerSalesHourPointEntity[];

	@Field(() => [WorkerCategorySalesEntity], { nullable: true })
	@IsOptional()
	salesByProductCategory?: WorkerCategorySalesEntity[];

	@Field(() => [TopSellingProductEntity], { nullable: true })
	@IsOptional()
	topSellingProducts?: TopSellingProductEntity[];
}

@ObjectType()
export class WorkerReportProductEntity {
	@Field({ nullable: true })
	@IsOptional()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	title: string;

	@Field({ nullable: true })
	@IsOptional()
	imageUrl?: string;

	@Field({ nullable: true })
	@IsOptional()
	quantitySold: number;

	@Field({ nullable: true })
	@IsOptional()
	revenue: number;

	@Field({ nullable: true })
	@IsOptional()
	profitMargin: number;

	@Field({ nullable: true })
	@IsOptional()
	averageRating: number;
}

@ObjectType()
export class WorkerReportSummaryEntity {
	@Field({ nullable: true })
	@IsOptional()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	totalSales: number;

	@Field({ nullable: true })
	@IsOptional()
	totalOrders: number;

	@Field({ nullable: true })
	@IsOptional()
	totalRevenue: number;

	@Field({ nullable: true })
	@IsOptional()
	averageOrderValue: number;

	@Field({ nullable: true })
	@IsOptional()
	activeCustomers: number;

	@Field(() => [WorkerReportProductEntity], { nullable: true })
	@IsOptional()
	topSellingProducts?: WorkerReportProductEntity[];

	@Field({ nullable: true })
	@IsOptional()
	period: string;

	@Field({ nullable: true })
	@IsOptional()
	reportType: string;
}

@ObjectType()
export class PaginatedWorkerReportsEntity {
	@Field(() => [WorkerReportSummaryEntity])
	items: WorkerReportSummaryEntity[];

	@Field({ nullable: true })
	total: number;

	@Field({ nullable: true })
	page: number;

	@Field({ nullable: true })
	limit: number;
}

@ObjectType()
export class WorkerSalesHistoryProductEntity {
	@Field({ nullable: true })
	@IsOptional()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	name: string;

	@Field({ nullable: true })
	@IsOptional()
	quantity: number;

	@Field({ nullable: true })
	@IsOptional()
	price: number;
}

@ObjectType()
export class WorkerSalesHistoryItemEntity {
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

	@Field({ nullable: true })
	@IsOptional()
	createdAt: Date;

	@Field(() => ClientEntity, { nullable: true })
	@IsOptional()
	client?: ClientEntity;

	@Field(() => [WorkerSalesHistoryProductEntity], { nullable: true })
	@IsOptional()
	products?: WorkerSalesHistoryProductEntity[];

	@Field({ nullable: true })
	@IsOptional()
	paymentMethod: string;

	@Field({ nullable: true })
	@IsOptional()
	deliveryAddress: string;
}

@ObjectType()
export class PaginatedWorkerSalesHistoryEntity {
	@Field(() => [WorkerSalesHistoryItemEntity])
	items: WorkerSalesHistoryItemEntity[];

	@Field({ nullable: true })
	total: number;

	@Field({ nullable: true })
	page: number;

	@Field({ nullable: true })
	limit: number;
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

	@Field({ nullable: true })
	@IsOptional()
	imageUrl?: string;

	@Field({ nullable: true })
	@IsOptional()
	profitMargin: number;

	@Field({ nullable: true })
	@IsOptional()
	averageRating: number;

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
