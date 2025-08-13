import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GraphQLModule } from '@nestjs/graphql'
import {
  ApolloDriver,
  ApolloDriverConfig,
} from '@nestjs/apollo'
import { join } from 'path'
import { PrismaModule } from './prisma/prisma.module'

import { ReferralModule } from './referral/referral.module';
import { FreelanceOrderModule } from './freelance-order/freelance-order.module';
import { FreelanceServiceModule } from './freelance-service/freelance-service.module';
import { AdModule } from './ad/ad.module';
import { PaymentTransactionModule } from './payment-transaction/payment-transaction.module';
import { TokenModule } from './token/token.module';
import { AccountRechargeModule } from './account-recharge/account-recharge.module';
import { KnowYourCustomerModule } from './know-your-customer/know-your-customer.module';
import { ReOwnedProductModule } from './re-owned-product/re-owned-product.module';
import { RepostedProductModule } from './reposted-product/reposted-product.module';
import { ChatNessageModule } from './chat-nessage/chat-nessage.module';
import { ChatModule } from './chat/chat.module';
import { ReviewModule } from './review/review.module';
import { OrderProductModule } from './order-product/order-product.module';
import { OrderModule } from './order/order.module';
import { BusinessModule } from './business/business.module';
import { ClientModule } from './client/client.module';
import { WorkerModule } from './worker/worker.module';
import { ProductModule } from './product/product.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config'
import { PostOfSaleModule } from './post-of-sale/post-of-sale.module';
import { CategoryModule } from './category/category.module';
import { TokenTransactionModule } from './token-transaction/token-transaction.module';
import { SaleModule } from './sale/sale.module';
import { StoreModule } from './store/store.module';
import { InventoryModule } from './inventory/inventory.module';
import { ShiftModule } from './shift/shift.module';
import { LoyaltyProgramModule } from './loyalty-program/loyalty-program.module';
import GraphQLJSON from 'graphql-type-json'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: process.env.NODE_ENV === 'production' ? true : join(
        process.cwd(),
        'src/graphql/schema.gql',
      ), // Path to the generated schema file, 
      resolvers: { JSON: GraphQLJSON },
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
