import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsArray, IsNumber, IsOptional, IsString, Min } from "class-validator";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class OfflineSaleProductInput {
	@Field()
	@IsString()
	productId: string;

	@Field(() => Int)
	@IsNumber()
	@Min(1)
	quantity: number;

	@Field(() => Float)
	@IsNumber()
	@Min(0)
	price: number;

	@Field(() => GraphQLJSON, { nullable: true })
	@IsOptional()
	modifiers?: any;
}

@InputType()
export class OfflineSaleInput {
	@Field()
	@IsString()
	localId: string;

	@Field()
	@IsString()
	storeId: string;

	@Field()
	@IsString()
	workerId: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	clientId?: string;

	@Field(() => Float)
	@IsNumber()
	totalAmount: number;

	@Field(() => Float, { defaultValue: 0 })
	@IsNumber()
	discount: number;

	@Field()
	@IsString()
	paymentMethod: string;

	@Field()
	@IsString()
	localTimestamp: string;

	@Field()
	@IsString()
	deviceId: string;

	@Field(() => [OfflineSaleProductInput])
	@IsArray()
	saleProducts: OfflineSaleProductInput[];
}

@InputType()
export class SyncOfflineSalesInput {
	@Field(() => [OfflineSaleInput])
	@IsArray()
	sales: OfflineSaleInput[];
}
