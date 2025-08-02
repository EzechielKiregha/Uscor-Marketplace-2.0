import { Module, Injectable } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context, Float } from '@nestjs/graphql';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsBoolean, IsNumber, Min, IsOptional, IsArray } from 'class-validator';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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