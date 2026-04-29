import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

@InputType()
export class PaymentMethodInput {
	@Field()
	@IsString()
	type: string;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	provider?: string;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	accountNumber?: string;

	@Field(() => Int, { nullable: true })
	@IsInt()
	@IsOptional()
	expiryMonth?: number;

	@Field(() => Int, { nullable: true })
	@IsInt()
	@IsOptional()
	expiryYear?: number;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	cardToken?: string;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	last4?: string;

	@Field({ nullable: true })
	@IsBoolean()
	@IsOptional()
	isDefault?: boolean;
}
