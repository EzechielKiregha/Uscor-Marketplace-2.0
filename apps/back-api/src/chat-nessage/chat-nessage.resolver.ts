import { Resolver } from '@nestjs/graphql';
import { ChatNessageService } from './chat-nessage.service';
import { ChatMessageEntity } from '../chat/entities/chat-nessage.entity';

@Resolver(() => ChatMessageEntity)
export class ChatNessageResolver {
  constructor(private readonly chatNessageService: ChatNessageService) {}
}
