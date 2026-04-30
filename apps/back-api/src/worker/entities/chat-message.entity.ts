import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { MessageSenderType } from "../dto/send-chat-message.input";

registerEnumType(MessageSenderType, {
	name: "MessageSenderType",
});

@ObjectType()
export class ChatMessageEntityV2 {
	@Field()
	id: string;

	@Field()
	chatId: string;

	@Field()
	content: string;

	@Field(() => MessageSenderType)
	senderType: MessageSenderType;

	@Field()
	senderId: string;

	@Field()
	createdAt: Date;
}
