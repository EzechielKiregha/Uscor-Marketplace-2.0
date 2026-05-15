import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { AccountRechargeResolver } from "./account-recharge.resolver";
import { AccountRechargeService } from "./account-recharge.service";

// Module
@Module({
	providers: [AccountRechargeResolver, AccountRechargeService, PrismaService],
	exports: [AccountRechargeService],
	imports: [PrismaModule],
})
export class AccountRechargeModule {}
