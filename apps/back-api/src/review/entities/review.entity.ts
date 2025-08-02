import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ClientEntity } from 'src/client/entities/client.entity';
import { ProductEntity } from 'src/product/entities/product.entity';

@ObjectType()
export class ReviewEntity {
  @Field()
  id: string;

  @Field()
  clientId: string;

  @Field()
  productId: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field()
  createdAt: Date;

  // Relations
  @Field(() => ClientEntity) // Client who wrote the review
  client: ClientEntity;

  @Field(() => ProductEntity) // Product being reviewed
  product: ProductEntity;
}
