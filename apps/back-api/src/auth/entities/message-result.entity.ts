import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class MessageResult {
	@Field(() => Boolean)
	success: boolean;

	@Field(() => String)
	message: string;
}
