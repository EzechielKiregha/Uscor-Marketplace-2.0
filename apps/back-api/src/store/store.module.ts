import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { BusinessService } from "../business/business.service"; // Assumed path
import { PrismaService } from "../prisma/prisma.service";
import { WorkerModule } from "../worker/worker.module";
import { WorkerService } from "../worker/worker.service"; // Assumed path
import { StoreResolver } from "./store.resolver";
import { StoreService } from "./store.service";

// Module
@Module({
	providers: [
		StoreResolver,
		StoreService,
		PrismaService,
		BusinessService,
		WorkerService,
	],
	imports: [BusinessModule, WorkerModule], // Import dependent modules
})
export class StoreModule {}
