import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { FreelanceServiceResolver } from "./freelance-service.resolver";
import { FreelanceServiceService } from "./freelance-service.service";

const pubSub = new PubSub();
// Module
@Module({
	providers: [
		FreelanceServiceResolver,
		FreelanceServiceService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	imports: [PrismaModule],
})
export class FreelanceServiceModule {}
