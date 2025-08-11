import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AdjustmentType } from '../../generated/prisma/enums';
import { ProductEntity } from '../../product/entities/product.entity';
import { StoreEntity } from '../../store/entities/store.entity';

@ObjectType()
export class InventoryAdjustmentEntity {
  @Field()
  id: string;

  @Field()
  productId: string;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field(() => AdjustmentType)
  adjustmentType: AdjustmentType;

  @Field(() => Int)
  quantity: number;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  createdAt: Date;
}
