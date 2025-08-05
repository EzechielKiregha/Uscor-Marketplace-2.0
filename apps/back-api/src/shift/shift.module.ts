import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreService } from '../store/store.service';
import { WorkerService } from '../worker/worker.service';
import { ShiftResolver } from './shift.resolver';
import { WorkerModule } from 'src/worker/worker.module';
import { ShiftService } from './shift.service';
import { StoreModule } from 'src/store/store.module';
import { BusinessModule } from 'src/business/business.module';
import { BusinessService } from 'src/business/business.service';


// Module
@Module({
  providers: [ShiftResolver, ShiftService, PrismaService, StoreService, WorkerService, BusinessService],
  imports: [StoreModule, WorkerModule, BusinessModule],
})
export class ShiftModule {}