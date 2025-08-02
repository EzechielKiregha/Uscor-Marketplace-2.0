import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ChatNessageService } from './chat-nessage.service';
import { ChatMessageEntity } from '../chat/entities/chat-nessage.entity';
import { CreateChatNessageInput } from './dto/create-chat-nessage.input';
import { UpdateChatNessageInput } from './dto/update-chat-nessage.input';

@Resolver(() => ChatMessageEntity)
export class ChatNessageResolver {
  constructor(private readonly chatNessageService: ChatNessageService) {}
}
