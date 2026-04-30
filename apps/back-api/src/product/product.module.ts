import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { MediaService } from "../media/media.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProductResolver } from "./product.resolver";
import { ProductService } from "./product.service";
import { PrismaModule } from "../prisma/prisma.module";
import { MediaModule } from "../media/media.module";

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
