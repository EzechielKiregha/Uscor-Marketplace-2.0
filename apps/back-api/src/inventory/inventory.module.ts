import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { BusinessModule } from "../business/business.module";
import { BusinessService } from "../business/business.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProductModule } from "../product/product.module";
import { ProductService } from "../product/product.service";
import { StoreModule } from "../store/store.module";
import { StoreService } from "../store/store.service";
import { WorkerModule } from "../worker/worker.module";
import { WorkerService } from "../worker/worker.service";
import { InventoryResolver } from "./inventory.resolver";
import { InventoryService } from "./inventory.service";

// Module
@Module({
	providers: [
		InventoryResolver,
		InventoryService,
		PrismaService,
		StoreService,
		ProductService,
		BusinessService,
		WorkerService,
		{
			provide: "PUB_SUB",
			useValue: new PubSub(),
		},
	],
	imports: [StoreModule, ProductModule, BusinessModule, WorkerModule],
})
export class InventoryModule {}
