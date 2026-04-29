import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";

export enum MobileMoneyProvider {
	MTN = "MTN",
	AIRTEL = "AIRTEL",
	VODAFONE = "VODAFONE",
}

registerEnumType(MobileMoneyProvider, {
	name: "MobileMoneyProvider",
});

@InputType()
export class ProcessMobileMoneyPaymentInput {
	@Field()
	@IsString()
	saleId: string;

	@Field()
	@IsString()
	phoneNumber: string;

	@Field()
	@IsString()
	amount: string;

	@Field(() => MobileMoneyProvider)
	@IsEnum(MobileMoneyProvider)
	provider: MobileMoneyProvider;
}
