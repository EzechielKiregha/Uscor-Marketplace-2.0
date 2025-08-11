import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenTransactionResolver } from './token-transaction.resolver';
import { AccountRechargeModule } from '../account-recharge/account-recharge.module';
import { TokenTransactionService } from './token-transaction.service';
import { AccountRechargeService } from '../account-recharge/account-recharge.service';

// Module
@Module({
  providers: [TokenTransactionResolver, TokenTransactionService, PrismaService, AccountRechargeService],
  imports: [AccountRechargeModule],
})
export class TokenTransactionModule {}