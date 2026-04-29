import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsString } from "class-validator";

@InputType()
export class RedeemTokenTransactionInput {
	@Field()
	@IsString()
	tokenTransactionId: string;

	@Field(() => Boolean)
	@IsBoolean()
	isRedeemed: boolean;
}
