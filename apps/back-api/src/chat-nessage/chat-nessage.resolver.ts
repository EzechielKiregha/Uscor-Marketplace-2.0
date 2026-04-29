import { Resolver } from "@nestjs/graphql";
import { ChatMessageEntity } from "../chat/entities/chat-nessage.entity";
import type { ChatNessageService } from "./chat-nessage.service";

@Resolver(() => ChatMessageEntity)
export class ChatNessageResolver {
	constructor(readonly _chatNessageService: ChatNessageService) {}
}
