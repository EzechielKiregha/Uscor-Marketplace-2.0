import { Module } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { AccountRechargeModule } from "../account-recharge/account-recharge.module";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import { BusinessModule } from "../business/business.module";
import { BusinessService } from "../business/business.service";
import { ClientModule } from "../client/client.module";
import { ClientService } from "../client/client.service";
import { LoyaltyProgramModule } from "../loyalty-program/loyalty-program.module";
import { LoyaltyService } from "../loyalty-program/loyalty-program.service";
import { PaymentTransactionModule } from "../payment-transaction/payment-transaction.module";
import { PaymentTransactionService } from "../payment-transaction/payment-transaction.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProductModule } from "../product/product.module";
import { ProductService } from "../product/product.service";
import { StoreModule } from "../store/store.module";
import { StoreService } from "../store/store.service";
import { TokenTransactionModule } from "../token-transaction/token-transaction.module";
import { TokenTransactionService } from "../token-transaction/token-transaction.service";
import { WorkerModule } from "../worker/worker.module";
import { WorkerService } from "../worker/worker.service";
import { SaleResolver } from "./sale.resolver";
import { SaleService } from "./sale.service";

// Module
@Module({
	providers: [
		SaleResolver,
		SaleService,
		PrismaService,
		StoreService,
		WorkerService,
		BusinessService,
		ProductService,
		ClientService,
		AccountRechargeService,
		TokenTransactionService,
		PaymentTransactionService,
		LoyaltyService,
		{
			provide: "PUB_SUB",
			useValue: new PubSub(),
		},
	],
	imports: [
		StoreModule,
		WorkerModule,
		BusinessModule,
		ProductModule,
		ClientModule,
		AccountRechargeModule,
		TokenTransactionModule,
		PaymentTransactionModule,
		LoyaltyProgramModule,
	],
})
export class SaleModule {}
