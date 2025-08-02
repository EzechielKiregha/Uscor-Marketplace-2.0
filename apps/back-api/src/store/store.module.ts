import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service'; // Assumed path
import { WorkerService } from '../worker/worker.service'; // Assumed path
import { StoreResolver } from './store.resolver';
import { StoreService } from './store.service';
import { BusinessModule } from 'src/business/business.module';
import { WorkerModule } from 'src/worker/worker.module';



// Module
@Module({
  providers: [StoreResolver, StoreService, PrismaService, BusinessService, WorkerService],
  imports: [BusinessModule, WorkerModule], // Import dependent modules
})
export class StoreModule {}