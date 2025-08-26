import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { PurchaseOrderStatus } from '../../generated/prisma/enums';
import { StoreEntity } from '../../store/entities/store.entity';
import { PurchaseOrderProductEntity } from './purchase-order-product.entity';


@ObjectType()
export class PurchaseOrderEntity {
  @Field({nullable : true})
  id?: string;

  @Field({nullable : true})
  businessId?: string;

  @Field(() => BusinessEntity, {nullable: true})
  business?: BusinessEntity;

  @Field({nullable : true})
  storeId?: string;

  @Field(() => StoreEntity, {nullable: true})
  store?: StoreEntity;

  @Field({nullable : true})
  supplierId?: string;

  @Field(() => PurchaseOrderStatus, {nullable: true})
  status: PurchaseOrderStatus;

  @Field({nullable : true})
  expectedDelivery?: Date;

  @Field({nullable : true})
  createdAt?: Date;

  @Field({nullable : true})
  updatedAt?: Date;

  @Field(() => [PurchaseOrderProductEntity, {nullable: true}])
  products?: PurchaseOrderProductEntity[];
}

