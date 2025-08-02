import { Module, Injectable } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { hash } from 'argon2';
import { BusinessEntity } from './entities/business.entity';
import { BusinessService } from './business.service';
import { CreateBusinessInput } from './dto/create-business.input';
import { BusinessResolver } from './business.resolver';

// Module
@Module({
  providers: [BusinessResolver, BusinessService, PrismaService],
})
export class BusinessModule {}