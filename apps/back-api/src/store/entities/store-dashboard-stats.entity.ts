import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { WorkerEntity } from "../../worker/entities/worker.entity";

@ObjectType()
export class TopSellingProduct {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  quantitySold: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
export class RecentSale {
  @Field()
  id: string;

  @Field(() => Float)
  totalAmount: number;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field(() => WorkerEntity, { nullable: true })
  worker?: WorkerEntity;
}

@ObjectType()
export class InventoryStatus {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  lowStockCount: number;

  @Field(() => Int)
  outOfStockCount: number;

  @Field(() => Int)
  inStockCount: number;
}

@ObjectType()
export class ShiftStats {
  @Field(() => Int)
  totalShifts: number;

  @Field(() => Int)
  completedShifts: number;

  @Field(() => Int)
  activeShifts: number;

  @Field(() => Float)
  averageSalesPerShift: number;
}

@ObjectType()
export class StoreDashboardStatsEntity {
  @Field(() => Int)
  activeWorkers: number;

  @Field(() => Float)
  todaySales: number;

  @Field(() => Int)
  todayTransactions: number;

  @Field(() => Int)
  lowStockItems: number;

  @Field(() => Int)
  outOfStockItems: number;

  @Field(() => Int)
  activeShifts: number;

  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  totalSales: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  averageTicket: number;

  @Field(() => [TopSellingProduct])
  topSellingProducts: TopSellingProduct[];

  @Field(() => [RecentSale])
  recentSales: RecentSale[];

  @Field(() => InventoryStatus)
  inventoryStatus: InventoryStatus;

  @Field(() => ShiftStats)
  shiftStats: ShiftStats;
}
