import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";

export enum MessageSenderType {
	WORKER = "WORKER",
	CLIENT = "CLIENT",
	BUSINESS = "BUSINESS",
}

registerEnumType(MessageSenderType, {
	name: "MessageSenderType",
});

@InputType()
export class SendChatMessageInput {
	@Field()
	@IsString()
	chatId: string;

	@Field()
	@IsString()
	message: string;

	@Field(() => MessageSenderType)
	@IsEnum(MessageSenderType)
	senderType: MessageSenderType;

	@Field()
	@IsString()
	senderId: string;
}
