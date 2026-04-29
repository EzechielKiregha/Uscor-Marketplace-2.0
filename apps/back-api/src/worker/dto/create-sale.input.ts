import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentMethod } from "../../payment-transaction/dto/create-payment-transaction.input";

export enum SaleStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	REFUNDED = "REFUNDED",
}

registerEnumType(SaleStatus, {
	name: "SaleStatus",
});

@InputType()
export class CreateSaleInput {
	@Field()
	@IsString()
	storeId: string;

	@Field()
	@IsString()
	workerId: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	clientId?: string;

	@Field(() => SaleStatus, {
		defaultValue: SaleStatus.PENDING,
	})
	@IsEnum(SaleStatus)
	status: SaleStatus;

	@Field(() => PaymentMethod)
	@IsEnum(PaymentMethod)
	paymentMethod: PaymentMethod;
}
