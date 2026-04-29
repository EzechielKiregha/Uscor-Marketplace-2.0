import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";
import { PaymentMethod } from "../../payment-transaction/dto/create-payment-transaction.input";

@InputType()
export class CompleteSaleInput {
	@Field()
	@IsString()
	id: string;

	@Field(() => PaymentMethod)
	@IsEnum(PaymentMethod)
	paymentMethod: PaymentMethod;
}
