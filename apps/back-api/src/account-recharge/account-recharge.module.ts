import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { AccountRechargeResolver } from "./account-recharge.resolver";
import { AccountRechargeService } from "./account-recharge.service";

// Module
@Module({
	providers: [
		AccountRechargeResolver,
		AccountRechargeService,
		PrismaService,
		{
			provide: "PUB_SUB",
			useValue: new PubSub(),
		},
	],
	exports: [AccountRechargeService],
	imports: [PrismaModule],
})
export class AccountRechargeModule {}
