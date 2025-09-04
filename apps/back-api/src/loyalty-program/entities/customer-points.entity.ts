import { ObjectType, Field, Float } from '@nestjs/graphql';
import { LoyaltyProgramEntity } from './loyalty-program.entity';

@ObjectType()
export class PointsTransactionSummaryEntity {
  @Field()
  id: string;

  @Field(() => Float)
  points: number;

  @Field()
  createdAt: Date;

  @Field()
  type: string; // 'EARNED' | 'REDEEMED'
}

@ObjectType()
export class CustomerPointsEntity {
  @Field(() => Float)
  totalPoints: number;

  @Field(() => LoyaltyProgramEntity)
  program: LoyaltyProgramEntity;

  @Field(() => [PointsTransactionSummaryEntity])
  transactions: PointsTransactionSummaryEntity[];
}