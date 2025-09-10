import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AccountRechargeResolver } from './account-recharge.resolver'
import { AccountRechargeService } from './account-recharge.service'

// Module
@Module({
  providers: [
    AccountRechargeResolver,
    AccountRechargeService,
    PrismaService,
  ],
})
export class AccountRechargeModule {}
