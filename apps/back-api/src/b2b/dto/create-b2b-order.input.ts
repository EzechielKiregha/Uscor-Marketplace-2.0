import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class B2BOrderItemInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	productId: string;

	@Field(() => Int)
	@IsNumber()
	@Min(1)
	quantity: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	notes?: string;
}

@InputType()
export class CreateB2BOrderInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	sellerId: string;

	@Field(() => [B2BOrderItemInput])
	@ValidateNested({ each: true })
	@Type(() => B2BOrderItemInput)
	items: B2BOrderItemInput[];

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	paymentTerms?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	notes?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	shippingAddress?: string;
}

@InputType()
export class UpdateB2BOrderStatusInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	orderId: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	status: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	rejectionReason?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	notes?: string;
}
