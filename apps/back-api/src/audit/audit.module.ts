import { Module } from '@nestjs/common'
import { AuditService } from './audit.service'
import { AuditResolver } from './audit.resolver'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  providers: [AuditResolver, AuditService, PrismaService],
})
export class AuditModule {}
