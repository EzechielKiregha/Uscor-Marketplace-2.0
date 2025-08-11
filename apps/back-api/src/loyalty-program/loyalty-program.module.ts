import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { ClientService } from '../client/client.service';
import { LoyaltyResolver } from './loyalty-program.resolver';
import { LoyaltyService } from './loyalty-program.service';
import { ClientModule } from '../client/client.module';
import { BusinessModule } from '../business/business.module';

// Module
@Module({
  providers: [LoyaltyResolver, LoyaltyService, PrismaService, BusinessService, ClientService],
  imports: [BusinessModule, ClientModule],
})
export class LoyaltyProgramModule {}