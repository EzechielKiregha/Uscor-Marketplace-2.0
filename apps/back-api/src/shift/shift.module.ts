import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { StoreService } from '../store/store.service'
import { WorkerService } from '../worker/worker.service'
import { ShiftResolver } from './shift.resolver'
import { WorkerModule } from '../worker/worker.module'
import { ShiftService } from './shift.service'
import { StoreModule } from '../store/store.module'
import { BusinessModule } from '../business/business.module'
import { BusinessService } from '../business/business.service'

// Module
@Module({
  providers: [
    ShiftResolver,
    ShiftService,
    PrismaService,
    StoreService,
    WorkerService,
    BusinessService,
  ],
  imports: [
    StoreModule,
    WorkerModule,
    BusinessModule,
  ],
})
export class ShiftModule {}
