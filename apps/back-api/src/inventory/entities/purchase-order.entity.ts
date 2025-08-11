import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { PurchaseOrderStatus } from '../../generated/prisma/enums';
import { StoreEntity } from '../../store/entities/store.entity';
import { PurchaseOrderProductEntity } from './purchase-order-product.entity';


@ObjectType()
export class PurchaseOrderEntity {
  @Field()
  id: string;

  @Field()
  businessId: string;

  @Field(() => BusinessEntity)
  business: BusinessEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field({ nullable: true })
  supplierId?: string;

  @Field(() => PurchaseOrderStatus)
  status: PurchaseOrderStatus;

  @Field({ nullable: true })
  expectedDelivery?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [PurchaseOrderProductEntity])
  products: PurchaseOrderProductEntity[];
}

