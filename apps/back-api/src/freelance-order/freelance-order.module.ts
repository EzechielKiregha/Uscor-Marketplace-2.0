import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { FreelanceOrderResolver } from './freelance-order.resolver'
import { FreelanceOrderService } from './freelance-order.service'
import { AccountRechargeModule } from '../account-recharge/account-recharge.module'
import { PaymentTransactionService } from '../payment-transaction/payment-transaction.service'
import { AccountRechargeService } from '../account-recharge/account-recharge.service'

// Module
@Module({
  providers: [
    FreelanceOrderResolver,
    FreelanceOrderService,
    PaymentTransactionService,
    AccountRechargeService,
    PrismaService,
  ],
  imports: [AccountRechargeModule],
})
export class FreelanceOrderModule {}
