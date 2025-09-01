import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AdjustmentType } from '../../generated/prisma/enums';
import { ProductEntity } from '../../product/entities/product.entity';
import { StoreEntity } from '../../store/entities/store.entity';

@ObjectType()
export class InventoryEntity {
  @Field({nullable: true})
  id?: string;

  @Field({nullable: true})
  productId?: string;

  @Field(() => ProductEntity, {nullable: true})
  product?: ProductEntity;

  @Field({nullable: true})
  storeId?: string;

  @Field(() => StoreEntity, {nullable: true})
  store?: StoreEntity;

  @Field(() => Int, {nullable: true})
  quantity?: number;

  @Field(() => Int, {nullable: true})
  minQuantity?: number;

  @Field({nullable: true})
  createdAt?: Date;

  @Field({nullable: true})
  updatedAt?: Date;
}

@ObjectType()
export class InventoryAdjustmentEntity {
  @Field({nullable: true})
  id?: string;

  @Field({nullable: true})
  productId?: string;

  @Field(() => ProductEntity, {nullable : true})
  product?: ProductEntity;

  @Field({nullable: true})
  storeId?: string;

  @Field(() => StoreEntity, {nullable : true})
  store?: StoreEntity;

  @Field(() => AdjustmentType, {nullable : true})
  adjustmentType?: AdjustmentType;

  @Field(() => Int, {nullable : true})
  quantity?: number;

  @Field({nullable: true})
  reason?: string;

  @Field({nullable: true})
  createdAt?: Date;
}

// Paginated response entities
@ObjectType()
export class PaginatedInventoryResponse {
  @Field(() => [InventoryEntity])
  items: InventoryEntity[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
