import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaService } from "../prisma/prisma.service";
import { DisputeResolver } from "./dispute.resolver";
import { DisputeService } from "./dispute.service";
import { PrismaModule } from "../prisma/prisma.module";

const pubSub = new PubSub();
@Module({
	providers: [
		DisputeResolver,
		DisputeService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	imports: [PrismaModule]
})
export class DisputeModule {}
