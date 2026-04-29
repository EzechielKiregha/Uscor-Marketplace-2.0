import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";

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
	quantity: number;

	@Field()
	@IsNumber()
	price: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	modifiers?: string;
}
