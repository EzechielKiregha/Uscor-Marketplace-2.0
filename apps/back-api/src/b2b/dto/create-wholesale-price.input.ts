import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class CreateWholesalePriceInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	productId: string;

	@Field(() => Int)
	@IsNumber()
	@Min(1)
	minQuantity: number;

	@Field(() => Float)
	@IsNumber()
	@Min(0)
	price: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsNumber()
	maxQuantity?: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	businessTypeRestriction?: string;
}

@InputType()
export class UpdateWholesalePriceInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	id: string;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	price?: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsNumber()
	minQuantity?: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsNumber()
	maxQuantity?: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	businessTypeRestriction?: string;

	@Field({ nullable: true })
	@IsOptional()
	isActive?: boolean;
}
