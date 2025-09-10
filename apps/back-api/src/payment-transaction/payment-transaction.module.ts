import { Module } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { PaymentTransactionResolver } from './payment-transaction.resolver'
import { PaymentTransactionService } from './payment-transaction.service'
import { AccountRechargeService } from '../account-recharge/account-recharge.service'
import { AccountRechargeModule } from '../account-recharge/account-recharge.module'

@Module({
  providers: [
    PaymentTransactionResolver,
    PaymentTransactionService,
    PrismaService,
    AccountRechargeService,
  ],
  imports: [AccountRechargeModule],
})
export class PaymentTransactionModule {}
