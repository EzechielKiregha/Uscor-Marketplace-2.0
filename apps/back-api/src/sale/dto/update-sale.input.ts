import { Field, InputType } from "@nestjs/graphql";
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";
import { PaymentMethod } from "../../payment-transaction/dto/create-payment-transaction.input";
import { SaleProductInput } from "./sale-product.input";

@InputType()
export class UpdateSaleInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	clientId?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	totalAmount?: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	discount?: number;

	@Field(() => PaymentMethod, { nullable: true })
	@IsOptional()
	@IsEnum(PaymentMethod)
	paymentMethod?: PaymentMethod;

	@Field(() => [SaleProductInput], {
		nullable: true,
	})
	@IsOptional()
	@IsArray()
	saleProducts?: SaleProductInput[];
}
