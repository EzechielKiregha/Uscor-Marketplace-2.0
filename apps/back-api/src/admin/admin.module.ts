import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaService } from "../prisma/prisma.service";
import { AdminResolver } from "./admin.resolver";
import { AdminService } from "./admin.service";
import { UserService } from "./user.service";
import { PrismaModule } from "../prisma/prisma.module";

const pubSub = new PubSub();

@Module({
	providers: [
		AdminResolver,
		AdminService,
		UserService,
		PrismaService,
		{ provide: "PUB_SUB", useValue: pubSub },
	],
	exports: [AdminService],
	imports: [PrismaModule]
})
export class AdminModule {}
