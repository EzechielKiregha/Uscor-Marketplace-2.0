import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ProductEntity } from 'src/product/entities/product.entity';

@ObjectType()
export class SaleProductEntity {
  @Field()
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => GraphQLJSON, { nullable: true })
  modifiers?: any;

  @Field()
  createdAt: Date;

  @Field(() => ProductEntity)
  product: ProductEntity;
}