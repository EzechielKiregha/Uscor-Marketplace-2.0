import { Module } from "@nestjs/common";
import { OrderProductResolver } from "./order-product.resolver";
import { OrderProductService } from "./order-product.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";

@Module({
	providers: [OrderProductResolver, OrderProductService, PrismaService],
	exports: [OrderProductService],
	imports: [PrismaModule]
})
export class OrderProductModule {}
