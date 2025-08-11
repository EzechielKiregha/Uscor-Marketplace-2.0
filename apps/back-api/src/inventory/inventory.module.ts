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
  ],
  imports: [StoreModule, ProductModule, BusinessModule, WorkerModule],
})
export class InventoryModule {}