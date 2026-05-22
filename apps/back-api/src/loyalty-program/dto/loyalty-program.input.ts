import { Field, Float, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

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

@InputType()
export class LoyaltyTierBenefitInput {
	@Field()
	@IsString()
	description: string;
}

@InputType()
export class CreateLoyaltyTierInput {
	@Field()
	@IsString()
	loyaltyProgramId: string;

	@Field()
	@IsString()
	name: string;

	@Field(() => Float)
	@IsNumber()
	@Min(0)
	minPoints: number;

	@Field(() => [LoyaltyTierBenefitInput], { nullable: true })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => LoyaltyTierBenefitInput)
	benefits?: LoyaltyTierBenefitInput[];
}

@InputType()
export class UpdateLoyaltyTierInput {
	@Field()
	@IsString()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	name?: string;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	minPoints?: number;

	@Field(() => [LoyaltyTierBenefitInput], { nullable: true })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => LoyaltyTierBenefitInput)
	benefits?: LoyaltyTierBenefitInput[];
}
