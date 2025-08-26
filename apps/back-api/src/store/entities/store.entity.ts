import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { PurchaseOrderEntity } from '../../inventory/entities/purchase-order.entity';
import { InventoryAdjustmentEntity } from '../../inventory/entities/inventory.entity';
import { TransferOrderEntity } from '../../inventory/entities/transfer-order.entity';
import { SaleEntity } from '../../sale/entities/sale.entity';
import { ShiftEntity } from '../../shift/entities/shift.entity';

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
 
  @Field(() => TransferOrderEntity)
  transferOrdersFrom: TransferOrderEntity
  
  @Field(() => TransferOrderEntity)
  transferOrdersTo: TransferOrderEntity
  
  @Field(() => InventoryAdjustmentEntity)
  inventoryAdjustments : InventoryAdjustmentEntity
  
  @Field(() => PurchaseOrderEntity)
  purchaseOrders: PurchaseOrderEntity
  
  @Field(() => SaleEntity)
  sales: SaleEntity
  
  @Field(() => ShiftEntity)
  shifts: ShiftEntity

}

// include: {
//   business: { select: { id: true, name: true, email: true, createdAt: true } },
//   transferOrdersFrom: { select : { id: true, status: true, createdAt:true}},
//   transferOrdersTo: { select : { id: true, status: true, createdAt: true}},
//   inventoryAdjustments: { select : { id: true, quantity: true, createdAt: true}},
//   purchaseOrders: { select : { id: true, status: true, createdAt : true}},
//   sales: { select : { id: true, totalAmount: true, createdAt: true}},
//   shifts: { select: { id: true, startTime: true, endTime: true, createdAt: true}}
// },

