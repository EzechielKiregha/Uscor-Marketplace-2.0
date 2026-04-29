import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";

@InputType()
export class UpdateSaleProductInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsNumber()
	quantity?: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsNumber()
	price?: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	modifiers?: string;
}
