import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { WorkerResolver } from "./worker.resolver";
import { WorkerService } from "./worker.service";

const pubSub = new PubSub();

@Module({
	providers: [
		WorkerResolver,
		WorkerService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	exports: [WorkerService],
	imports: [PrismaModule],
})
export class WorkerModule {}
