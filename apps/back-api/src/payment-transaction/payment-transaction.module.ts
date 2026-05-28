import { Module } from "@nestjs/common";
import { AccountRechargeModule } from "../account-recharge/account-recharge.module";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import { BusinessService } from "../business/business.service";
import { ClientService } from "../client/client.service";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentTransactionResolver } from "./payment-transaction.resolver";
import { PaymentTransactionService } from "./payment-transaction.service";

@Module({
	providers: [
		PaymentTransactionResolver,
		PaymentTransactionService,
		PrismaService,
		AccountRechargeService,
		BusinessService,
		ClientService,
	],
	imports: [AccountRechargeModule],
})
export class PaymentTransactionModule {}
