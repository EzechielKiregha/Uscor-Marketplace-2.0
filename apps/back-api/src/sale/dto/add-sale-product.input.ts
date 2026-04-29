import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class AddSaleProductInput {
	@Field()
	@IsString()
	saleId: string;

	@Field()
	@IsString()
	productId: string;

	@Field()
	@IsNumber()
	@Min(1)
	quantity: number;

	@Field(() => GraphQLJSON, { nullable: true })
	@IsOptional()
	modifiers?: any;
}
