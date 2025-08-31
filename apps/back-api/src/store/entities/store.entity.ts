import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { PurchaseOrderEntity } from '../../inventory/entities/purchase-order.entity';
import { InventoryAdjustmentEntity } from '../../inventory/entities/inventory.entity';
import { TransferOrderEntity } from '../../inventory/entities/transfer-order.entity';
import { SaleEntity } from '../../sale/entities/sale.entity';
import { ShiftEntity } from '../../shift/entities/shift.entity';
import { ProductEntity } from '../../product/entities/product.entity';

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
 
  @Field(() => [TransferOrderEntity], { nullable: true })
  transferOrdersFrom?: TransferOrderEntity[]
  
  @Field(() => [TransferOrderEntity], { nullable: true })
  transferOrdersTo?: TransferOrderEntity[]
  
  @Field(() => [InventoryAdjustmentEntity], { nullable: true })
  inventoryAdjustments?: InventoryAdjustmentEntity[]
  
  @Field(() => [PurchaseOrderEntity], { nullable: true })
  purchaseOrders?: PurchaseOrderEntity[]
  
  @Field(() => [SaleEntity], { nullable: true })
  sales?: SaleEntity[]
  
  @Field(() => [ShiftEntity], { nullable: true })
  shifts?: ShiftEntity[]

  @Field(() => [ProductEntity], { nullable: true })
  products?: ProductEntity[]

}