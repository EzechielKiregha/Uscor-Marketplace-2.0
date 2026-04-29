import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaService } from "../prisma/prisma.service";
import { PlatformResolver } from "./platform.resolver";
import { PlatformService } from "./platform.service";

const pubSub = new PubSub();

@Module({
	providers: [
		PlatformResolver,
		PlatformService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
})
export class PlatformModule {}
