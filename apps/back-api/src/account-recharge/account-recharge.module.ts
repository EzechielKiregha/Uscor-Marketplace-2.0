import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccountRechargeResolver } from "./account-recharge.resolver";
import { AccountRechargeService } from "./account-recharge.service";
import { PrismaModule } from "../prisma/prisma.module";

// Module
@Module({
	providers: [AccountRechargeResolver, AccountRechargeService, PrismaService],
	exports: [AccountRechargeService],
	imports:[PrismaModule],
})
export class AccountRechargeModule {}
