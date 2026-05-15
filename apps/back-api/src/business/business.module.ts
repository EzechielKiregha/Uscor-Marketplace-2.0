import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessResolver } from "./business.resolver";
import { BusinessService } from "./business.service";

const pubSub = new PubSub();

// Module
@Module({
	providers: [
		BusinessResolver,
		BusinessService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	imports: [PrismaModule],
})
export class BusinessModule {}
