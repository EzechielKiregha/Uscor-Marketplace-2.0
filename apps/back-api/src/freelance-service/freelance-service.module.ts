import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { registerEnumType } from '@nestjs/graphql';
import { FreelanceServiceResolver } from './freelance-service.resolver';
import { FreelanceServiceService } from './freelance-service.service';

// Enums
export enum FreelanceCategory {
  PLUMBER = 'PLUMBER',
  ELECTRICIAN = 'ELECTRICIAN',
  CARPENTER = 'CARPENTER',
  MECHANIC = 'MECHANIC',
  TUTOR = 'TUTOR',
  CLEANER = 'CLEANER',
  OTHER = 'OTHER',
}

registerEnumType(FreelanceCategory, { name: 'FreelanceCategory' });




// Module
@Module({
  providers: [FreelanceServiceResolver, FreelanceServiceService, PrismaService],
})
export class FreelanceServiceModule {}