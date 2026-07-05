import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { BusinessService } from "../business/business.service";
import { InventoryService } from "../inventory/inventory.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { ProductService } from "../product/product.service";
import { StoreService } from "../store/store.service";
import { WorkerResolver } from "./worker.resolver";
import { WorkerService } from "./worker.service";

const pubSub = new PubSub();

@Module({
	providers: [
		WorkerResolver,
		WorkerService,
		PrismaService,
        InventoryService,
        StoreService,
        ProductService,
        BusinessService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	exports: [WorkerService],
	imports: [PrismaModule],
})
export class WorkerModule {}
