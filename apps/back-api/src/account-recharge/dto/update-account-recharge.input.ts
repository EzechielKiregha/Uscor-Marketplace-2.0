import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Country, RechargeMethod } from "./create-account-recharge.input";

@InputType()
export class UpdateAccountRechargeInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	amount?: number;

	@Field(() => RechargeMethod, { nullable: true })
	@IsOptional()
	@IsEnum(RechargeMethod)
	method?: RechargeMethod;

	@Field(() => Country, { nullable: true })
	@IsOptional()
	@IsEnum(Country)
	origin?: Country;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	status?: string;
}
