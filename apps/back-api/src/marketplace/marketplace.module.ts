import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceResolver } from './marketplace.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { ProductModule } from '../product/product.module';
import { FreelanceServiceModule } from '../freelance-service/freelance-service.module';
import { PubSub } from 'graphql-subscriptions';
import { ProductService } from '../product/product.service';
import { FreelanceServiceService } from '../freelance-service/freelance-service.service';

const pubSub = new PubSub()

@Module({
  imports: [ProductModule, FreelanceServiceModule],
  providers: [
    MarketplaceResolver,
     MarketplaceService,
     PrismaService,
     ProductService,
     FreelanceServiceService,
     { provide: 'PUB_SUB', useValue: pubSub },],
})
export class MarketplaceModule {}
