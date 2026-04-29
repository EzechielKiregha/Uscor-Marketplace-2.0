import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsString } from "class-validator";

@InputType()
export class ReleaseTokenTransactionInput {
	@Field()
	@IsString()
	tokenTransactionId: string;

	@Field(() => Boolean)
	@IsBoolean()
	isReleased: boolean;
}
