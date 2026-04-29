import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { ChatService } from "../chat/chat.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ReOwnedProductResolver } from "./re-owned-product.resolver";
import { ReOwnedProductService } from "./re-owned-product.service";

// Module
@Module({
	providers: [
		ReOwnedProductResolver,
		ReOwnedProductService,
		ChatService,
		PrismaService,
	],
	imports: [ChatModule],
})
export class ReOwnedProductModule {}
