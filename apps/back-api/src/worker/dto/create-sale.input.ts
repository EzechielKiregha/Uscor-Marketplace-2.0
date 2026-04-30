import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentMethod } from "../../payment-transaction/dto/create-payment-transaction.input";
import { SaleStatus } from "../../generated/prisma/enums";

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
