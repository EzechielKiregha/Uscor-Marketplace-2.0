import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { B2BResolver } from "./b2b.resolver";
import { B2BService } from "./b2b.service";

@Module({
	providers: [B2BResolver, B2BService, PrismaService],
	imports: [PrismaModule, ChatModule],
	exports: [B2BService],
})
export class B2BModule {}
