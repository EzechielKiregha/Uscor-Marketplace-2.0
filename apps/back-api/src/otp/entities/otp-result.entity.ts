import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OtpResult {
	@Field(() => Boolean)
	success: boolean;

	@Field(() => String)
	message: string;
}
