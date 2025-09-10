import { Module } from '@nestjs/common'
import { ChatNessageService } from './chat-nessage.service'
import { ChatNessageResolver } from './chat-nessage.resolver'

@Module({
  providers: [
    ChatNessageResolver,
    ChatNessageService,
  ],
})
export class ChatNessageModule {}
