import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsResolver } from "./settings.resolver";
import { SettingsService } from "./settings.service";
import { PrismaModule } from "../prisma/prisma.module";

const pubSub = new PubSub();

@Module({
	providers: [
		SettingsResolver,
		SettingsService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	exports: [SettingsService],
	imports: [PrismaModule]
})
export class SettingsModule {}
