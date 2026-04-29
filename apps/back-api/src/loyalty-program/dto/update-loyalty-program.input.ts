import { Field, Float, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class UpdateLoyaltyProgramInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	name?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	description?: string;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	pointsPerPurchase?: number;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	minimumPointsToRedeem?: number;
}
