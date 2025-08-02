import { ObjectType, Field, Float } from '@nestjs/graphql';
import { BusinessEntity } from 'src/business/entities/business.entity';
import { ProductEntity } from 'src/product/entities/product.entity';

@ObjectType()
export class RepostedProductEntity {
  @Field()
  id: string;

  @Field()
  productId: string;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  businessId: string;

  @Field(() => BusinessEntity)
  business: BusinessEntity;

  @Field(() => Float)
  markupPercentage: number;

  @Field()
  createdAt: Date;
}
