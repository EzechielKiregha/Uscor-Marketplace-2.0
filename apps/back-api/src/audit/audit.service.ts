import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll({ action, adminId, startDate, endDate, page = 1, limit = 10 }: any) {
    const where: any = {}
    if (action) where.action = action
    if (adminId) where.adminId = adminId
    if (startDate || endDate) where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)

    const [items, total] = await Promise.all([
      (this.prisma as any).auditLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      (this.prisma as any).auditLog.count({ where }),
    ])

    return { items, total, page, limit }
  }
}