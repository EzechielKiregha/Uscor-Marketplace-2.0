import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { ChatResolver } from "./chat.resolver";
import { ChatService } from "./chat.service";
import { PusherService } from "./pusher.service";

// Module
@Module({
	providers: [ChatResolver, ChatService, PrismaService, PusherService],
	imports: [PrismaModule],
})
export class ChatModule {}
