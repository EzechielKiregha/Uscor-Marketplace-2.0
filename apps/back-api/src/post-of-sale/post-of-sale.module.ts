import { Module } from "@nestjs/common";
import { PostOfSaleResolver } from "./post-of-sale.resolver";
import { PostOfSaleService } from "./post-of-sale.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";

@Module({
	providers: [PostOfSaleResolver, PostOfSaleService, PrismaService],
		imports: [PrismaModule]
})
export class PostOfSaleModule {}
