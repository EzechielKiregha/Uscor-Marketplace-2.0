import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';

@ObjectType()
export class LoyaltyProgramEntity {
  @Field()
  id: string;

  @Field()
  businessId: string;

  @Field(() => BusinessEntity)
  business: BusinessEntity;

  @Field()
  name: string;

  @Field(() => Float)
  pointsPerPurchase: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}


