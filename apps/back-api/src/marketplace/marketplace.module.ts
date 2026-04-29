import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { FreelanceServiceModule } from "../freelance-service/freelance-service.module";
import { FreelanceServiceService } from "../freelance-service/freelance-service.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProductModule } from "../product/product.module";
import { ProductService } from "../product/product.service";
import { MarketplaceResolver } from "./marketplace.resolver";
import { MarketplaceService } from "./marketplace.service";

const pubSub = new PubSub();

@Module({
	imports: [ProductModule, FreelanceServiceModule],
	providers: [
		MarketplaceResolver,
		MarketplaceService,
		PrismaService,
		ProductService,
		FreelanceServiceService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
})
export class MarketplaceModule {}
