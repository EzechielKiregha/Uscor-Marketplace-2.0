import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAdminInput } from './dto/create-admin.input'
import { UpdateAdminInput } from './dto/update-admin.input'
import { PubSub } from 'graphql-subscriptions'
import { hash } from 'argon2'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, @Inject('PUB_SUB') private pubSub: PubSub) {}

  async create(input: CreateAdminInput) {
    const data: any = { ...input }
    if (data.password) {
      data.password = await hash(data.password)
    }
    const admin = await (this.prisma as any).admin.create({ data })
    // do not return password to callers (GraphQL type omits it)
    await this.pubSub.publish('NEW_ADMIN', { newAdmin: { id: admin.id, email: admin.email, fullName: admin.fullName } })
    return admin
  }

  async findAll({ page = 1, limit = 10, search }: any) {
    const where: any = {}
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { fullName: { contains: search, mode: 'insensitive' } }]
    const [items, total] = await Promise.all([
      (this.prisma as any).admin.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      (this.prisma as any).admin.count({ where }),
    ])
    return { items, total, page, limit }
  }

  async findAllUsers({ page = 1, limit = 10, search, role, status, kycStatus, businessType }: any) {
    const where: any = {}
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { fullName: { contains: search, mode: 'insensitive' } }, { username: { contains: search, mode: 'insensitive' } }]
    if (role) where.role = role
    if (status) where.status = status
    if (kycStatus) where.kycStatus = kycStatus
    if (businessType) where.businessType = businessType

    const [items, total] = await Promise.all([
      (this.prisma as any).client.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      (this.prisma as any).client.count({ where }),
    ])

    return { items, total, page, limit }
  }

  async findOne(id: string) {
    return (this.prisma as any).admin.findUnique({ where: { id } })
  }

  async update(id: string, input: UpdateAdminInput) {
    return (this.prisma as any).admin.update({ where: { id }, data: { ...input } })
  }

  async remove(id: string) {
    return (this.prisma as any).admin.delete({ where: { id } })
  }

  /**
   * Register a one-time SUPERADMIN. If a SUPERADMIN exists, throw an error.
   * This is intended for bootstrap/first-time setup only.
   */
  async registerSuperAdmin(input: CreateAdminInput) {
    const client = this.prisma as any
    const existing = await client.admin.findFirst({ where: { role: 'SUPERADMIN' } })
    if (existing) throw new Error('Super admin already exists')

    const data: any = { ...input, role: 'SUPERADMIN' }
    if (data.password) data.password = await hash(data.password)
    const admin = await client.admin.create({ data })
    await this.pubSub.publish('NEW_ADMIN', { newAdmin: { id: admin.id, email: admin.email, fullName: admin.fullName } })
    return admin
  }

  
}