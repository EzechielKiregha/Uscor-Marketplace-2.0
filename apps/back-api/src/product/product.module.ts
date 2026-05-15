import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { MediaModule } from "../media/media.module";
import { MediaService } from "../media/media.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { ProductResolver } from "./product.resolver";
import { ProductService } from "./product.service";

const pubSub = new PubSub();

@Module({
	providers: [
		ProductResolver,
		ProductService,
		MediaService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	exports: [ProductService],
	imports: [PrismaModule, MediaModule],
})
export class ProductModule {}
