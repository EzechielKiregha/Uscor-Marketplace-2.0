import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { WorkerResolver } from './worker.resolver'
import { WorkerService } from './worker.service'

// Module
@Module({
  providers: [
    WorkerResolver,
    WorkerService,
    PrismaService,
  ],
})
export class WorkerModule {}
