import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ChatResolver } from './chat.resolver'
import { ChatService } from './chat.service'

// Module
@Module({
  providers: [
    ChatResolver,
    ChatService,
    PrismaService,
  ],
})
export class ChatModule {}
