import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { TokenTransactionModule } from 'src/token-transaction/token-transaction.module';
import { TokenTransactionService } from 'src/token-transaction/token-transaction.service';
import { AccountRechargeService } from 'src/account-recharge/account-recharge.service';
import { AccountRechargeModule } from 'src/account-recharge/account-recharge.module';


// Module
@Module({
  providers: [OrderResolver, OrderService, TokenTransactionService, PrismaService, AccountRechargeService],
  imports: [TokenTransactionModule, AccountRechargeModule],
})
export class OrderModule {}
