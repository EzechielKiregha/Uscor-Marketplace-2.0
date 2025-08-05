import { Module, Injectable } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Float, Int, Context } from '@nestjs/graphql';
import { ObjectType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsString, IsNumber, Min, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StoreService } from '../store/store.service';
import { WorkerService } from '../worker/worker.service';
import { BusinessService } from '../business/business.service';
import { ProductService } from '../product/product.service';
import { ClientService } from '../client/client.service';
import { AccountRechargeService } from '../account-recharge/account-recharge.service';
import { TokenTransactionService } from '../token-transaction/token-transaction.service';
import { SaleStatus, PaymentMethod } from '../generated/prisma/enums';
import { Country, RechargeMethod } from '../account-recharge/dto/create-account-recharge.input';
import { TokenTransactionType } from '../token-transaction/dto/create-token-transaction.input';
import { createWriteStream } from 'fs';
import { SaleResolver } from './sale.resolver';
import { SaleService } from './sale.service';
import { StoreModule } from 'src/store/store.module';
import { WorkerModule } from 'src/worker/worker.module';
import { BusinessModule } from 'src/business/business.module';
import { ProductModule } from 'src/product/product.module';
import { AccountRechargeModule } from 'src/account-recharge/account-recharge.module';
import { ClientModule } from 'src/client/client.module';
import { TokenTransactionModule } from 'src/token-transaction/token-transaction.module';
import { LoyaltyProgramModule } from 'src/loyalty-program/loyalty-program.module';
import { LoyaltyService } from 'src/loyalty-program/loyalty-program.service';




// Module
@Module({
  providers: [
    SaleResolver,
    SaleService,
    PrismaService,
    StoreService,
    WorkerService,
    BusinessService,
    ProductService,
    ClientService,
    AccountRechargeService,
    TokenTransactionService,
    LoyaltyService,
  ],
  imports: [
    StoreModule,
    WorkerModule,
    BusinessModule,
    ProductModule,
    ClientModule,
    AccountRechargeModule,
    TokenTransactionModule,
    LoyaltyProgramModule,
  ],
})
export class SaleModule {}