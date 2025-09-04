import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { PointsTransactionEntity } from './points-transaction.entity';

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

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  pointsPerPurchase: number;

  @Field(() => Float, { nullable: true })
  minimumPointsToRedeem?: number;

  @Field(() => [PointsTransactionEntity], { nullable: true })
  pointsTransactions?: PointsTransactionEntity[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}


