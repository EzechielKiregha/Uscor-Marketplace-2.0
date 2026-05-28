import { Field, ObjectType, Float, Int } from "@nestjs/graphql";
import { BusinessEntity } from "../../business/entities/business.entity";
import { InventoryAdjustmentEntity } from "../../inventory/entities/inventory.entity";
import { PurchaseOrderEntity } from "../../inventory/entities/purchase-order.entity";
import { TransferOrderEntity } from "../../inventory/entities/transfer-order.entity";
import { ProductEntity } from "../../product/entities/product.entity";
import { SaleEntity } from "../../sale/entities/sale.entity";
import { ShiftEntity } from "../../shift/entities/shift.entity";
import { WorkerEntity } from "../../worker/entities/worker.entity";

@ObjectType()
export class StoreDailyStats {
	@Field(() => Float)
	todaySales: number;

	@Field(() => Int)
	todayTransactions: number;

	@Field(() => Int)
	lowStockItems: number;
}

@ObjectType()
export class StoreInventoryStats {
	@Field(() => Int)
	lowStockItems: number;

	@Field(() => Int)
	outOfStockItems: number;

	@Field(() => Int)
	totalItems: number;
}

@ObjectType()
export class StoreEntity {
	@Field()
	id: string;

	@Field()
	businessId: string;

	@Field()
	name: string;

	@Field({ nullable: true })
	address?: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	// relations
	@Field(() => BusinessEntity)
	business: BusinessEntity;

	@Field(() => [TransferOrderEntity], {
		nullable: true,
	})
	transferOrdersFrom?: TransferOrderEntity[];

	@Field(() => [TransferOrderEntity], {
		nullable: true,
	})
	transferOrdersTo?: TransferOrderEntity[];

	@Field(() => [InventoryAdjustmentEntity], {
		nullable: true,
	})
	inventoryAdjustments?: InventoryAdjustmentEntity[];

	@Field(() => [PurchaseOrderEntity], {
		nullable: true,
	})
	purchaseOrders?: PurchaseOrderEntity[];

	@Field(() => [SaleEntity], { nullable: true })
	sales?: SaleEntity[];

	@Field(() => [ShiftEntity], { nullable: true })
	shifts?: ShiftEntity[];

	@Field(() => [ProductEntity], {
		nullable: true,
	})
	products?: ProductEntity[];

	@Field(() => [WorkerEntity], { nullable: true })
	workers?: WorkerEntity[];

	@Field(() => StoreDailyStats, { nullable: true })
	dailyStats?: StoreDailyStats;

	@Field(() => StoreInventoryStats, { nullable: true })
	inventoryStats?: StoreInventoryStats;
}
