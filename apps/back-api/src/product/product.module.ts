import { Module } from '@nestjs/common';
import { Float, Int } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';


@Module({
  providers: [ProductResolver, ProductService, PrismaService],
})
export class ProductModule {}