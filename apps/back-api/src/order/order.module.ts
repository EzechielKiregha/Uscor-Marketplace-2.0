import { Module } from "@nestjs/common";
import { AccountRechargeModule } from "../account-recharge/account-recharge.module";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import { PrismaService } from "../prisma/prisma.service";
import { TokenTransactionModule } from "../token-transaction/token-transaction.module";
import { TokenTransactionService } from "../token-transaction/token-transaction.service";
import { OrderResolver } from "./order.resolver";
import { OrderService } from "./order.service";

// Module
@Module({
	providers: [
		OrderResolver,
		OrderService,
		TokenTransactionService,
		PrismaService,
		AccountRechargeService,
	],
	imports: [TokenTransactionModule, AccountRechargeModule],
})
export class OrderModule {}
