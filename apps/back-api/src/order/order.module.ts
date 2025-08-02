import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { TokenTransactionModule } from 'src/token-transaction/token-transaction.module';
import { TokenTransactionService } from 'src/token-transaction/token-transaction.service';


// Module
@Module({
  providers: [OrderResolver, OrderService, TokenTransactionService, PrismaService],
  imports: [TokenTransactionModule],
})
export class OrderModule {}
