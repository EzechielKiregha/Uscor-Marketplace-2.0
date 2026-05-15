import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsResolver } from "./settings.resolver";
import { SettingsService } from "./settings.service";

const pubSub = new PubSub();

@Module({
	providers: [
		SettingsResolver,
		SettingsService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	exports: [SettingsService],
	imports: [PrismaModule],
})
export class SettingsModule {}
