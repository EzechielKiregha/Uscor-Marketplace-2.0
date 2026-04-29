import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class UpdatePaymentTransactionInput {
	@Field({ nullable: true })
	@IsOptional()
	status?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	qrCode?: string;
}
