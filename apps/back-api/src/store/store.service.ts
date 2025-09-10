import { Injectable } from '@nestjs/common'
import { CreateStoreInput } from './dto/create-store.input'
import { UpdateStoreInput } from './dto/update-store.input'
import { PrismaService } from '../prisma/prisma.service'
import { BusinessService } from '../business/business.service'
import { WorkerService } from '../worker/worker.service'
import { AuthPayload } from 'src/auth/entities/auth-payload.entity'

// Service
@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
    private workerService: WorkerService,
  ) {}

  async create(
    createStoreInput: CreateStoreInput,
  ) {
    const { businessId, name, address } =
      createStoreInput

    // Validate business using BusinessService
    const business =
      await this.businessService.findOne(
        businessId,
      )
    if (!business) {
      throw new Error('Business not found')
    }

    return this.prisma.store.create({
      data: {
        business: { connect: { id: businessId } },
        name,
        address,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async update(
    id: string,
    updateStoreInput: UpdateStoreInput,
    businessId: string,
  ) {
    const store =
      await this.prisma.store.findUnique({
        where: { id },
        select: { businessId: true },
      })
    if (!store) {
      throw new Error('Store not found')
    }
    if (store.businessId !== businessId) {
      throw new Error(
        'Only the owning business can update this store',
      )
    }

    return this.prisma.store.update({
      where: { id },
      data: {
        name: updateStoreInput.name,
        address: updateStoreInput.address,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async remove(id: string, businessId: string) {
    const store =
      await this.prisma.store.findUnique({
        where: { id },
        select: { businessId: true },
      })
    if (!store) {
      throw new Error('Store not found')
    }
    if (store.businessId !== businessId) {
      throw new Error(
        'Only the owning business can delete this store',
      )
    }

    // Check for dependencies
    const sales =
      await this.prisma.sale.findFirst({
        where: { storeId: id },
      })
    if (sales) {
      throw new Error(
        'Cannot delete store with associated sales',
      )
    }
    const products =
      await this.prisma.product.findFirst({
        where: { storeId: id },
      })
    if (products) {
      throw new Error(
        'Cannot delete store with associated products',
      )
    }

    return await this.prisma.store.delete({
      where: { id },
      select: { id: true, name: true },
    })
  }

  async findAll(businessId: string) {
    return await this.prisma.store.findMany({
      where: { businessId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        transferOrdersFrom: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        transferOrdersTo: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        inventoryAdjustments: {
          select: {
            id: true,
            quantity: true,
            createdAt: true,
          },
        },
        purchaseOrders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        sales: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        shifts: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            createdAt: true,
          },
        },
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            quantity: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            sales: true,
            products: true,
            shifts: true,
            purchaseOrders: true,
          },
        },
      },
    })
  }

  async getStoreStatistics(
    storeId: string,
    businessId: string,
  ) {
    // Verify store belongs to business
    const store =
      await this.prisma.store.findFirst({
        where: { id: storeId, businessId },
      })

    if (!store) {
      throw new Error(
        'Store not found or access denied',
      )
    }

    const now = new Date()
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    )
    const startOfWeek = new Date(
      now.setDate(now.getDate() - now.getDay()),
    )

    // Get sales statistics
    const [
      totalSales,
      monthlySales,
      weeklySales,
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
    ] = await Promise.all([
      this.prisma.sale.count({
        where: { storeId },
      }),
      this.prisma.sale.count({
        where: {
          storeId,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.sale.count({
        where: {
          storeId,
          createdAt: { gte: startOfWeek },
        },
      }),
      this.prisma.sale.aggregate({
        where: { storeId, status: 'CLOSED' },
        _sum: { totalAmount: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          storeId,
          status: 'CLOSED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          storeId,
          status: 'CLOSED',
          createdAt: { gte: startOfWeek },
        },
        _sum: { totalAmount: true },
      }),
    ])

    // Get product statistics
    const [totalProducts, lowStockProducts] =
      await Promise.all([
        this.prisma.product.count({
          where: { storeId },
        }),
        this.prisma.product.count({
          where: {
            storeId,
            quantity: { lt: 10 },
          },
        }),
      ])

    return {
      sales: {
        total: totalSales,
        monthly: monthlySales,
        weekly: weeklySales,
      },
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        monthly:
          monthlyRevenue._sum.totalAmount || 0,
        weekly:
          weeklyRevenue._sum.totalAmount || 0,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
    }
  }

  async findOne(id: string) {
    const store =
      await this.prisma.store.findUnique({
        where: { id },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      })
    if (!store) {
      throw new Error('Store not found')
    }
    return store
  }

  async verifyStoreAccess(
    storeId: string,
    user: AuthPayload,
  ) {
    const store = await this.findOne(storeId)
    if (
      user.role === 'business' &&
      store.businessId !== user.id
    ) {
      throw new Error(
        'Business can only access their own stores',
      )
    }
    if (user.role === 'worker') {
      const worker =
        await this.workerService.findOne(user.id)

      if (!worker)
        throw new Error('Worker not found')

      if (
        store.businessId !== worker.businessId
      ) {
        throw new Error(
          'Worker can only access stores of their business',
        )
      }
    }
    return store
  }

  async verifyBusinessAccess(user: AuthPayload) {
    const worker =
      await this.workerService.findOne(user.id)

    if (!worker)
      throw new Error('Worker not found')

    const business = this.businessService.findOne(
      worker.businessId,
    )

    if (!business) {
      throw new Error(
        'Worker can only access stores of their business',
      )
    }

    return true
  }
}
