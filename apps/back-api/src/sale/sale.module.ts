import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { WorkerService } from '../worker/worker.service';
import { ProductService } from '../product/product.service';
import { AccountRechargeService } from '../account-recharge/account-recharge.service';
import { TokenTransactionService } from '../token-transaction/token-transaction.service';
import { StoreService } from '../store/store.service';
import { SaleResolver } from './sale.resolver';
import { SaleService } from './sale.service';
import { AccountRechargeModule } from 'src/account-recharge/account-recharge.module';
import { BusinessModule } from 'src/business/business.module';
import { ProductModule } from 'src/product/product.module';
import { StoreModule } from 'src/store/store.module';
import { TokenTransactionModule } from 'src/token-transaction/token-transaction.module';
import { WorkerModule } from 'src/worker/worker.module';


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
    AccountRechargeService,
    TokenTransactionService,
  ],
  imports: [
    StoreModule,
    WorkerModule,
    BusinessModule,
    ProductModule,
    AccountRechargeModule,
    TokenTransactionModule,
  ],
})
export class SaleModule {}