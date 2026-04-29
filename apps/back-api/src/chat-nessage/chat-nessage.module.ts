import { Module } from "@nestjs/common";
import { ChatNessageResolver } from "./chat-nessage.resolver";
import { ChatNessageService } from "./chat-nessage.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	providers: [ChatNessageResolver, ChatNessageService, PrismaService],
	imports: [PrismaModule]
})
export class ChatNessageModule {}
