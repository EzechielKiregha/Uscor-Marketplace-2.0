import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreService } from '../store/store.service';
import { ProductService } from '../product/product.service';
import { BusinessService } from '../business/business.service';
import { WorkerService } from '../worker/worker.service';
import { InventoryResolver } from './inventory.resolver';
import { InventoryService } from './inventory.service';
import { StoreModule } from '../store/store.module';
import { ProductModule } from '../product/product.module';
import { BusinessModule } from '../business/business.module';
import { WorkerModule } from '../worker/worker.module';
import { PubSub } from 'graphql-subscriptions';


// Module
@Module({
  providers: [
    InventoryResolver,
    InventoryService,
    PrismaService,
    StoreService,
    ProductService,
    BusinessService,
    WorkerService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  imports: [StoreModule, ProductModule, BusinessModule, WorkerModule],
})
export class InventoryModule {}