import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import {
	Country,
	RechargeMethod,
} from "../../account-recharge/dto/create-account-recharge.input";
import { SaleStatus } from "../../generated/prisma/enums";
import { PaymentMethod } from "../../payment-transaction/dto/create-payment-transaction.input";

// Enums
registerEnumType(SaleStatus, {
	name: "SaleStatus",
});

@InputType()
export class PaymentDetailsInput {
	// For Mobile Money
	@Field(() => RechargeMethod, { nullable: true })
	@IsOptional()
	@IsEnum(RechargeMethod)
	mobileMoneyMethod?: RechargeMethod;

	@Field(() => Country, { nullable: true })
	@IsOptional()
	@IsEnum(Country)
	country?: Country;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	operatorTransactionId?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	screenshotUrl?: string;

	// For Card Payment
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	cardNumber?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	cardHolderName?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	expiryDate?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	cvv?: string;

	// For Token Payment
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	tokenAmount?: string; // Amount in tokens (uTn)
}

@InputType()
export class CloseSaleInput {
	@Field()
	@IsString()
	saleId: string;

	@Field(() => PaymentMethod)
	@IsEnum(PaymentMethod)
	paymentMethod: PaymentMethod;

	@Field(() => SaleStatus, { nullable: true })
	@IsOptional()
	@IsEnum(SaleStatus)
	status?: SaleStatus;

	@Field(() => PaymentDetailsInput, {
		nullable: true,
	})
	@IsOptional()
	@IsObject()
	paymentDetails?: PaymentDetailsInput;
}
