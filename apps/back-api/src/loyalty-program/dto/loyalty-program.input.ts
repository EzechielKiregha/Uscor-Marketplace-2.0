import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNumber, IsString, Min } from 'class-validator';

// DTOs
@InputType()
export class CreateLoyaltyProgramInput {
  @Field()
  @IsString()
  businessId: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  pointsPerPurchase: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  minimumPointsToRedeem?: number;
}



@InputType()
export class CreatePointsTransactionInput {
  @Field()
  @IsString()
  clientId: string;

  @Field()
  @IsString()
  loyaltyProgramId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  points: number;
}

@InputType()
export class EarnPointsInput {
  @Field()
  @IsString()
  clientId: string;

  @Field()
  @IsString()
  loyaltyProgramId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  points: number;

  @Field({ nullable: true })
  @IsString()
  orderId?: string;
}

@InputType()
export class RedeemPointsInput {
  @Field()
  @IsString()
  clientId: string;

  @Field()
  @IsString()
  loyaltyProgramId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  points: number;

  @Field({ nullable: true })
  @IsString()
  rewardDescription?: string;
}

