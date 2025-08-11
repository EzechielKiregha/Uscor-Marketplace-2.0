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

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  pointsPerPurchase: number;
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

