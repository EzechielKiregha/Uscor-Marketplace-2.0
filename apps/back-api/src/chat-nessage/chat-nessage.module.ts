import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { ChatNessageResolver } from "./chat-nessage.resolver";
import { ChatNessageService } from "./chat-nessage.service";

@Module({
	providers: [ChatNessageResolver, ChatNessageService, PrismaService],
	imports: [PrismaModule],
})
export class ChatNessageModule {}
