import { join } from "node:path";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import GraphQLJSON from "graphql-type-json";
import { AccountRechargeModule } from "./account-recharge/account-recharge.module";
import { AdModule } from "./ad/ad.module";
import { AdminModule } from "./admin/admin.module";
import { AnnouncementModule } from "./announcement/announcement.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessModule } from "./business/business.module";
import { CategoryModule } from "./category/category.module";
import { ChatModule } from "./chat/chat.module";
import { ChatNessageModule } from "./chat-nessage/chat-nessage.module";
import { ClientModule } from "./client/client.module";
import { DisputeModule } from "./dispute/dispute.module";
import { FreelanceOrderModule } from "./freelance-order/freelance-order.module";
import { FreelanceServiceModule } from "./freelance-service/freelance-service.module";
import { InventoryModule } from "./inventory/inventory.module";
import { KnowYourCustomerModule } from "./know-your-customer/know-your-customer.module";
import { LoyaltyProgramModule } from "./loyalty-program/loyalty-program.module";
import { MarketplaceModule } from "./marketplace/marketplace.module";
import { MediaModule } from "./media/media.module";
import { OrderModule } from "./order/order.module";
import { OrderProductModule } from "./order-product/order-product.module";
import { PaymentTransactionModule } from "./payment-transaction/payment-transaction.module";
import { PlatformModule } from "./platform/platform.module";
import { PostOfSaleModule } from "./post-of-sale/post-of-sale.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductModule } from "./product/product.module";
import { ReOwnedProductModule } from "./re-owned-product/re-owned-product.module";
import { ReferralModule } from "./referral/referral.module";
import { RepostedProductModule } from "./reposted-product/reposted-product.module";
import { ReviewModule } from "./review/review.module";
import { SaleModule } from "./sale/sale.module";
import { SettingsModule } from "./settings/settings.module";
import { ShiftModule } from "./shift/shift.module";
import { StoreModule } from "./store/store.module";
import { TokenModule } from "./token/token.module";
import { TokenTransactionModule } from "./token-transaction/token-transaction.module";
import { WorkerModule } from "./worker/worker.module";

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile:
				process.env.NODE_ENV === "production"
					? true
					: join(process.cwd(), "src/graphql/schema.gql"), // Path to the generated schema file,
			resolvers: { JSON: GraphQLJSON },
			csrfPrevention: false,
			subscriptions: {
				"graphql-ws": true,
				"subscriptions-transport-ws": true,
			},
			installSubscriptionHandlers: true,
		}),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		ProductModule,
		OrderModule,
		MediaModule,
		BusinessModule,
		ClientModule,
		WorkerModule,
		OrderProductModule,
		ReviewModule,
		ChatModule,
		ChatNessageModule,
		RepostedProductModule,
		ReOwnedProductModule,
		KnowYourCustomerModule,
		AccountRechargeModule,
		TokenModule,
		PaymentTransactionModule,
		AdModule,
		FreelanceServiceModule,
		FreelanceOrderModule,
		ReferralModule,
		AuthModule,
		PostOfSaleModule,
		CategoryModule,
		TokenTransactionModule,
		SaleModule,
		StoreModule,
		InventoryModule,
		ShiftModule,
		LoyaltyProgramModule,
		SettingsModule,
		MarketplaceModule,
		AdminModule,
		AnnouncementModule,
		DisputeModule,
		AuditModule,
		PlatformModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: "PUB_SUB",
			useValue: new PubSub(),
		},
	],
})
export class AppModule {}
