import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateChatNessageInput } from "./create-chat-nessage.input";

@InputType()
export class UpdateChatNessageInput extends PartialType(
	CreateChatNessageInput,
) {
	@Field(() => Int)
	id: number;
}
