import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProductEntity } from 'src/product/entities/product.entity';

@ObjectType()
export class TransferOrderProductEntity {
  @Field()
  id: string;

  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  createdAt: Date;
}

