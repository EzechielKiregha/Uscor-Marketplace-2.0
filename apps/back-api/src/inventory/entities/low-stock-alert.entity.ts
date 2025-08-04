import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProductEntity } from 'src/product/entities/product.entity';
import { StoreEntity } from 'src/store/entities/store.entity';

@ObjectType()
export class LowStockAlertEntity {
  @Field()
  productId: string;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  threshold: number;
}
