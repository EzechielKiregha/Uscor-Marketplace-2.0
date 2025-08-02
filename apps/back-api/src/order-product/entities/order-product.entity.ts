import { ObjectType, Field, Int } from '@nestjs/graphql';
import { OrderEntity } from 'src/order/entities/order.entity';
import { ProductEntity } from 'src/product/entities/product.entity';

@ObjectType()
export class OrderProductEntity {
  @Field()
  id: string;

  @Field()
  orderId: string;

  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;

  // Relations
  @Field(() => OrderEntity) // Order associated with the product
  order: OrderEntity;

  @Field(() => ProductEntity) // Product associated with the order
  product: ProductEntity;
}
