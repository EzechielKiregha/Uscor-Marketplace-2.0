import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { registerEnumType } from '@nestjs/graphql';
import { FreelanceServiceResolver } from './freelance-service.resolver';
import { FreelanceServiceService } from './freelance-service.service';

// Module
@Module({
  providers: [FreelanceServiceResolver, FreelanceServiceService, PrismaService],
})
export class FreelanceServiceModule {}