import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreService } from '../store/store.service';
import { WorkerService } from '../worker/worker.service';
import { BusinessService } from '../business/business.service';
import { ProductService } from '../product/product.service';
import { ClientService } from '../client/client.service';
import { AccountRechargeService } from '../account-recharge/account-recharge.service';
import { TokenTransactionService } from '../token-transaction/token-transaction.service';
import { SaleResolver } from './sale.resolver';
import { SaleService } from './sale.service';
import { StoreModule } from '../store/store.module';
import { WorkerModule } from '../worker/worker.module';
import { BusinessModule } from '../business/business.module';
import { ProductModule } from '../product/product.module';
import { AccountRechargeModule } from '../account-recharge/account-recharge.module';
import { ClientModule } from '../client/client.module';
import { TokenTransactionModule } from '../token-transaction/token-transaction.module';
import { LoyaltyProgramModule } from '../loyalty-program/loyalty-program.module';
import { LoyaltyService } from '../loyalty-program/loyalty-program.service';
import { PubSub } from 'graphql-subscriptions';




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
    LoyaltyService,
    {
      provide: 'PUB_SUB',
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
    LoyaltyProgramModule,
  ],
})
export class SaleModule {}