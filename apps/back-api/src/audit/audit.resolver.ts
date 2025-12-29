import { Resolver, Query, Args, Int } from '@nestjs/graphql'
import { AuditService } from './audit.service'
import { PaginatedAuditLogsResponse } from './entities/audit-log.entity'

@Resolver()
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @Query(() => PaginatedAuditLogsResponse)
  async auditLogs(
    @Args('action', { type: () => String, nullable: true }) action?: string,
    @Args('adminId', { type: () => String, nullable: true }) adminId?: string,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit?: number,
  ) {
    const safePage = Math.max(1, Math.floor(page ?? 1))
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit ?? 10)))
    return this.auditService.findAll({ action, adminId, startDate, endDate, page: safePage, limit: safeLimit })
  }
}
