import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { BusinessEntity } from 'src/business/entities/business.entity';
import { ProductEntity } from 'src/product/entities/product.entity';

@ObjectType()
export class AdEntity {
  @Field()
  id: string;

  @Field()
  businessId: string;

  @Field()
  productId: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  periodDays: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  endedAt?: Date;

  // Relations
  @Field(() => BusinessEntity) // Business associated with the ad
  business: BusinessEntity;

  @Field(() => ProductEntity) // Product being advertised
  product: ProductEntity;
}
