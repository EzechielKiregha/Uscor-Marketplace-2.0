import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { AnnouncementResolver } from "./announcement.resolver";
import { AnnouncementService } from "./announcement.service";

const pubSub = new PubSub();

@Module({
	providers: [
		AnnouncementResolver,
		AnnouncementService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	imports: [PrismaModule],
})
export class AnnouncementModule {}
