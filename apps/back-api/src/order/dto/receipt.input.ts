import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class GenerateOrderReceiptInput {
	@Field()
	@IsString()
	orderId: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	email?: string;
}
