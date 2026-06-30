import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class CreateProductInput {
	@Field()
	@IsString()
	title: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	description?: string;

	@Field(() => Float)
	@IsNumber()
	@Min(0)
	price: number;

	@Field(() => Int)
	@IsNumber()
	@Min(1)
	quantity: number;

	@Field({ nullable: true })
	@IsOptional()
	storeId: string;

	@Field()
	@IsBoolean()
	isPhysical: boolean;

	@Field()
	@IsString()
	businessId: string;

	@Field()
	@IsString()
	categoryId: string;

	@Field(() => Boolean, { defaultValue: false })
	@IsOptional()
	featured?: boolean;

	@Field(() => Boolean, { defaultValue: true })
	@IsOptional()
	approvedForSale?: boolean;

	// Business-type-specific fields
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	brand?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	serialNumber?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	imei?: string;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsNumber()
	warrantyMonths?: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	sku?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	barcode?: string;

	@Field(() => GraphQLJSON, { nullable: true })
	@IsOptional()
	variants?: any;
}
