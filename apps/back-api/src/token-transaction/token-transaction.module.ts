import { Module } from "@nestjs/common";
import { AccountRechargeModule } from "../account-recharge/account-recharge.module";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { TokenTransactionResolver } from "./token-transaction.resolver";
import { TokenTransactionService } from "./token-transaction.service";

// Module
@Module({
	providers: [
		TokenTransactionResolver,
		TokenTransactionService,
		PrismaService,
		AccountRechargeService,
	],
	imports: [AccountRechargeModule, PrismaModule],
})
export class TokenTransactionModule {}
