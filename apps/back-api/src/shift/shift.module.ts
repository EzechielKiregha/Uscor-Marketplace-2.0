import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { BusinessService } from "../business/business.service";
import { PrismaService } from "../prisma/prisma.service";
import { StoreModule } from "../store/store.module";
import { StoreService } from "../store/store.service";
import { WorkerModule } from "../worker/worker.module";
import { WorkerService } from "../worker/worker.service";
import { ShiftResolver } from "./shift.resolver";
import { ShiftService } from "./shift.service";

// Module
@Module({
	providers: [
		ShiftResolver,
		ShiftService,
		PrismaService,
		StoreService,
		WorkerService,
		BusinessService,
	],
	imports: [StoreModule, WorkerModule, BusinessModule],
})
export class ShiftModule {}
