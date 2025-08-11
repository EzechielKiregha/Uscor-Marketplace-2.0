import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from './business.service';
import { BusinessResolver } from './business.resolver';

// Module
@Module({
  providers: [BusinessResolver, BusinessService, PrismaService],
})
export class BusinessModule {}