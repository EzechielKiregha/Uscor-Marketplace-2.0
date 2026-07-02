import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { put } from "@vercel/blob";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { AuthPayload } from "../auth/entities/auth-payload.entity";
import { BusinessService } from "../business/business.service";
import { ShiftStatus } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { WorkerService } from "../worker/worker.service";
import { AddWorkerToStoreInput } from "./dto/add-worker-to-store.input";
import { CreateStoreInput } from "./dto/create-store.input";
import { GenerateStoreReportInput, ReportType } from "./dto/report.dto";
import { UpdateStoreInput } from "./dto/update-store.input";
import {
    ReportHistoryEntity,
    StoreReportResponse,
} from "./entities/report.entity";
import { StoreDashboardStatsEntity } from "./entities/store-dashboard-stats.entity";
import { StoreInventoryEntity } from "./entities/store-inventory.entity";
import { StoreReportEntity } from "./entities/store-report.entity";

// Service
@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
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
        workers: true,
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

  async findOne(
    id: string,
    includeRelations = false,
  ) {
    const store =
      await this.prisma.store.findUnique({
        where: { id },
        include: includeRelations
          ? {
              business: {
                select: { id: true, name: true },
              },
              workers: true,
              products: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  quantity: true,
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
                },
              },
              purchaseOrders: {
                select: {
                  id: true,
                  status: true,
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
            }
          : {
              business: {
                select: { id: true, name: true },
              },
            },
      })
    if (!store) throw new Error('Store not found')
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

  async addWorkerToStore(
    input: AddWorkerToStoreInput,
    user: AuthPayload,
  ) {
    const { storeId, email } = input

    // Verify store access
    await this.verifyStoreAccess(storeId, user)

    const worker =
      await this.workerService.findOneByEmain(
        email!,
      )
    if (!worker)
      throw new Error('Worker not found')

    // Ensure worker belongs to the same business
    const store =
      await this.prisma.store.findUnique({
        where: { id: storeId },
        select: { businessId: true },
      })
    if (
      store &&
      store.businessId !== worker.businessId
    ) {
      throw new Error(
        'Worker does not belong to this business',
      )
    }

    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        workers: { connect: { id: worker.id } },
      },
    })

    return this.workerService.findOneByEmain(
      email!,
    ) // returns full WorkerEntity
  }

  async removeWorkerFromStore(
    storeId: string,
    workerId: string,
    user: AuthPayload,
  ): Promise<{
    success: boolean
    message: string
  }> {
    await this.verifyStoreAccess(storeId, user)

    const store =
      await this.prisma.store.findUnique({
        where: { id: storeId },
        select: {
          workers: {
            where: { id: workerId },
            select: { id: true },
          },
        },
      })

    if (!store?.workers?.length) {
      throw new Error(
        'Worker is not assigned to this store',
      )
    }

    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        workers: { disconnect: { id: workerId } },
      },
    })

    return {
      success: true,
      message:
        'Worker removed from store successfully',
    }
  }

  async getStoreWorkers(
    storeId: string,
    user: AuthPayload,
  ) {
    await this.verifyStoreAccess(storeId, user)

    return this.prisma.worker.findMany({
      where: {
        stores: { some: { id: storeId } },
      },
      include: {
        business: {
          select: { id: true, name: true },
        },
        stores: {
          select: { id: true, name: true },
        },
        kyc: true,
        shifts: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            sales: true,
          },
        },
        sales: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async getStoreDashboardStats(
    storeId: string,
    user: AuthPayload,
  ): Promise<StoreDashboardStatsEntity> {
    await this.verifyStoreAccess(storeId, user)

    const now = new Date()
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )

    const [
      activeWorkers,
      todaySalesAgg,
      todayTransactions,
      lowStockItems,
      outOfStockItems,
      activeShifts,
      totalProducts,
      totalSalesCount,
      totalRevenueAgg,
      topSellingProducts,
      recentSales,
      inventoryData,
      shiftData,
    ] = await Promise.all([
      // Active workers (have an active shift)
      this.prisma.worker.count({
        where: {
          stores: { some: { id: storeId } },
          shifts: {
            some: { storeId, status: 'ACTIVE' },
          },
        },
      }),
      // Today's sales amount
      this.prisma.sale.aggregate({
        where: {
          storeId,
          status: 'CLOSED',
          createdAt: { gte: startOfToday },
        },
        _sum: { totalAmount: true },
      }),
      // Today's transaction count
      this.prisma.sale.count({
        where: {
          storeId,
          createdAt: { gte: startOfToday },
        },
      }),
      // Low stock (quantity > 0 && < minQuantity)
      this.prisma.product.count({
        where: {
          storeId,
          quantity: { gt: 0, lt: 10 },
        },
      }),
      // Out of stock
      this.prisma.product.count({
        where: { storeId, quantity: 0 },
      }),
      // Active shifts
      this.prisma.shift.count({
        where: { storeId, status: 'ACTIVE' },
      }),
      // Total products
      this.prisma.product.count({
        where: { storeId },
      }),
      // Total sales count
      this.prisma.sale.count({
        where: { storeId },
      }),
      // Total revenue
      this.prisma.sale.aggregate({
        where: { storeId, status: 'CLOSED' },
        _sum: { totalAmount: true },
      }),
      // Top selling products via sale items — adjust relation name to match your schema
      this.prisma.saleProduct.groupBy({
        by: ['productId'],
        where: { sale: { storeId } },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      // Recent sales
      this.prisma.sale.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          worker: {
            select: { id: true, fullName: true },
          },
        },
      }),
      // Inventory stats
      this.prisma.product.aggregate({
        where: { storeId },
        _count: { id: true },
      }),
      // Shift stats
      this.prisma.shift.groupBy({
        by: ['status'],
        where: { storeId },
        _count: { id: true },
        _avg: { sales: true },
      }),
    ])

    // Resolve top selling product details
    const productIds = topSellingProducts.map(
      (p) => p.productId,
    )
    const products =
      await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true },
      })
    const productMap = Object.fromEntries(
      products.map((p) => [p.id, p.title]),
    )

    const totalRevenue =
      totalRevenueAgg._sum.totalAmount ?? 0
    const completedShifts =
      shiftData.find(
        (s) => s.status === 'COMPLETED',
      )?._count.id ?? 0
    const activeShiftCount =
      shiftData.find((s) => s.status === 'ACTIVE')
        ?._count.id ?? 0
    const totalShifts = shiftData.reduce(
      (acc, s) => acc + s._count.id,
      0,
    )
    const avgSalesPerShift =
      shiftData.find(
        (s) => s.status === 'COMPLETED',
      )?._avg?.sales ?? 0

    const inStockCount =
      await this.prisma.product.count({
        where: { storeId, quantity: { gte: 10 } },
      })

    return {
      activeWorkers,
      todaySales:
        todaySalesAgg._sum.totalAmount ?? 0,
      todayTransactions,
      lowStockItems,
      outOfStockItems,
      activeShifts,
      totalProducts,
      totalSales: totalSalesCount,
      totalRevenue,
      averageTicket:
        totalSalesCount > 0
          ? totalRevenue / totalSalesCount
          : 0,
      topSellingProducts: topSellingProducts.map(
        (p) => ({
          id: p.productId,
          title:
            productMap[p.productId] ?? 'Unknown',
          quantitySold: p?._sum.quantity! ?? 0,
          revenue: p?._sum.price! ?? 0,
        }),
      ),
      recentSales: recentSales.map((s) => ({
        id: s.id,
        totalAmount: s.totalAmount,
        status: s.status,
        createdAt: s.createdAt,
        worker: s.worker!,
      })),
      inventoryStatus: {
        totalItems: inventoryData._count.id,
        lowStockCount: lowStockItems,
        outOfStockCount: outOfStockItems,
        inStockCount,
      },
      shiftStats: {
        totalShifts,
        completedShifts,
        activeShifts: activeShiftCount,
        averageSalesPerShift:
          avgSalesPerShift ?? 0,
      },
    }
  }

  async getStoreReports(
    storeId: string,
    period: string,
    user: AuthPayload,
  ): Promise<StoreReportEntity> {
    await this.verifyStoreAccess(storeId, user)

    const now = new Date()
    const periodMap: Record<string, Date> = {
      day: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ),
      week: new Date(
        now.setDate(now.getDate() - now.getDay()),
      ),
      month: new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
      year: new Date(now.getFullYear(), 0, 1),
    }
    const since =
      periodMap[period] ?? periodMap.week

    const [
      salesAgg,
      salesCount,
      topItems,
      workers,
      dailyRaw,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          storeId,
          status: 'CLOSED',
          createdAt: { gte: since },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.sale.count({
        where: {
          storeId,
          createdAt: { gte: since },
        },
      }),
      this.prisma.saleProduct.groupBy({
        by: ['productId'],
        where: {
          sale: {
            storeId,
            createdAt: { gte: since },
          },
        },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.prisma.worker.findMany({
        where: {
          stores: { some: { id: storeId } },
        },
        include: {
          shifts: {
            where: {
              storeId,
              createdAt: { gte: since },
            },
            select: {
              startTime: true,
              endTime: true,
              sales: true,
              status: true,
            },
          },
          sales: {
            where: {
              storeId,
              createdAt: { gte: since },
            },
            select: { totalAmount: true },
          },
        },
      }),
      this.prisma.sale.findMany({
        where: {
          storeId,
          createdAt: { gte: since },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    // Resolve product titles
    const productIds = topItems.map(
      (i) => i.productId,
    )
    const products =
      await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true },
      })
    const productMap = Object.fromEntries(
      products.map((p) => [p.id, p.title]),
    )

    // Aggregate daily sales
    const dailyMap = new Map<
      string,
      { sales: number; orders: number }
    >()
    for (const sale of dailyRaw) {
      const date = sale.createdAt
        .toISOString()
        .split('T')[0]
      const entry = dailyMap.get(date) ?? {
        sales: 0,
        orders: 0,
      }
      entry.sales += sale.totalAmount
      entry.orders += 1
      dailyMap.set(date, entry)
    }

    const totalSales =
      salesAgg._sum.totalAmount ?? 0

    return {
      totalSales,
      totalOrders: salesCount,
      averageTicket:
        salesCount > 0
          ? totalSales / salesCount
          : 0,
      topProducts: topItems.map((i) => ({
        id: i.productId,
        title:
          productMap[i.productId] ?? 'Unknown',
        quantitySold: i._sum.quantity ?? 0,
        revenue: i?._sum.price ?? 0,
      })),
      workerPerformance: workers.map((w) => {
        const hoursWorked = w.shifts.reduce(
          (acc, s) => {
            if (!s.endTime) return acc
            return (
              acc +
              (s.endTime.getTime() -
                s.startTime.getTime()) /
                3_600_000
            )
          },
          0,
        )
        const completedShifts = w.shifts.filter(
          (s) => s.status === 'COMPLETED',
        ).length
        return {
          workerId: w.id,
          workerName: w.fullName!,
          sales: w.sales.reduce(
            (acc, s) => acc + s.totalAmount,
            0,
          ),
          hoursWorked,
          completionRate:
            w.shifts.length > 0
              ? (completedShifts /
                  w.shifts.length) *
                100
              : 0,
        }
      }),
      dailySales: Array.from(
        dailyMap.entries(),
      ).map(([date, v]) => ({
        date,
        sales: v.sales,
        orders: v.orders,
      })),
    }
  }

  async getStoreShifts(
    storeId: string,
    status: ShiftStatus,
    user: AuthPayload,
  ) {
    await this.verifyStoreAccess(storeId, user)

    return this.prisma.shift.findMany({
      where: {
        storeId,
        ...(status ? { status } : {}),
      },
      include: {
        worker: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getStoreInventory(
    storeId: string,
    user: AuthPayload,
  ): Promise<StoreInventoryEntity> {
    await this.verifyStoreAccess(storeId, user)

    const products =
      await this.prisma.product.findMany({
        where: { storeId },
        include: {
          medias: {
            select: {
              id: true,
              url: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      })

    const items: any = products.map((p) => {
      const minQty = p.minQuantity ?? 0
      let status = 'IN_STOCK'
      if (p.quantity === 0)
        status = 'OUT_OF_STOCK'
      else if (p.quantity < minQty)
        status = 'LOW_STOCK'

      return {
        id: p.id,
        productId: p.id,
        product: p,
        quantity: p.quantity,
        minQuantity: minQty,
        status,
      }
    })

    console.log(items)

    return {
      items,
      totalItems: items.length,
      lowStockCount: items.filter(
        (i) => i.status === 'LOW_STOCK',
      ).length,
      outOfStockCount: items.filter(
        (i) => i.status === 'OUT_OF_STOCK',
      ).length,
    }
  }
  async getStoreProducts(
    storeId: string,
    user: AuthPayload,
  ) {
    await this.verifyStoreAccess(storeId, user)

    const products =
      await this.prisma.product.findMany({
        where: { storeId },
        include: {
          medias: {
            select: {
              id: true,
              url: true,
              pathname: true,
              type: true,
              size: true,
              createdAt: true,
              productId: true
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      })

    return products
  }

  private getDateRange(
    period: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    if (startDate && endDate)
      return { start: startDate, end: endDate }
    const now = new Date()
    const end = new Date()
    let start: Date

    switch (period) {
      case 'week':
        start = new Date(now)
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        )
        break
      case 'quarter':
        start = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          1,
        )
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        break
      default:
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        )
    }
    return { start, end }
  }

  async generateStoreReport(
    input: GenerateStoreReportInput,
    user: AuthPayload,
  ): Promise<StoreReportResponse> {
    // Verify access
    await this.verifyStoreAccess(
      input.storeId,
      user,
    )

    // Get date range
    const { start, end } = this.getDateRange(
      input.period,
      input.startDate,
      input.endDate,
    )

    // Fetch store & business
    const store =
      await this.prisma.store.findUnique({
        where: { id: input.storeId },
        include: { business: true },
      })
    if (!store || !store.business)
      throw new Error(
        'Store or Business not found',
      )

    // Fetch report-specific data
    const reportData = await this.fetchReportData(
      input.reportType,
      input.storeId,
      start,
      end,
    )

    // Generate QR code for dashboard link
    const qrData = `https://uscor-marketplace-2-0-front-ui.vercel.app/store/${input.storeId}/reports`
    const qrBase64 =
      await QRCode.toDataURL(qrData)

    // Generate HTML
    const html = this.buildReportHTML(
      input.reportType,
      store.business,
      store,
      reportData,
      qrBase64,
      input.period,
      start,
      end,
    )

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    })
    const page = await browser.newPage()
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    })
    await page.waitForNetworkIdle()

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        bottom: '15px',
        left: '15px',
        right: '15px',
      },
    })
    await browser.close()

    // Upload to Vercel Blob
    const blobToken = this.configService.get(
      'NEST_PUBLIC_BLOB_READ_WRITE_TOKEN',
    )
    if (!blobToken)
      throw new Error('Blob token missing')

    const fileName = `report_${input.reportType}_${input.storeId}_${Date.now()}.pdf`
    const { url, pathname } = await put(
      `reports/${fileName}`,
      Buffer.from(pdfBuffer),
      {
        access: 'public',
        contentType: 'application/pdf',
        token: blobToken,
      },
    )

    // Create Media record
    const media = await this.prisma.media.create({
      data: {
        url,
        pathname,
        type: 'DOCUMENT',
        size: BigInt(pdfBuffer.length),
        storeId: store.id,
        businessId: store.businessId,
      },
    })

    return {
      reportUrl: url,
      fileName,
      mediaId: media.id,
    }
  }

  async getReportHistory(
    storeId: string,
    user: AuthPayload,
  ): Promise<ReportHistoryEntity[]> {
    await this.verifyStoreAccess(storeId, user)

    // Query Media documents tagged as reports
    const docs = await this.prisma.media.findMany(
      {
        where: {
          storeId,
          type: 'DOCUMENT',
          pathname: { startsWith: 'reports/' },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    )

    return docs.map((m) => ({
      id: m.id,
      reportType: ReportType.STORE_OVERVIEW, // Parse from filename in production
      period: 'month',
      generatedAt: m.createdAt,
      url: m.url,
      fileName:
        m.pathname?.split('/').pop() ||
        'unknown.pdf',
      storeId,
    }))
  }

  // ─── DATA FETCHING ──────────────────────────────────────────────────────
  private async fetchReportData(
    type: ReportType,
    storeId: string,
    start: Date,
    end: Date,
  ) {
    switch (type) {
      case ReportType.STORE_OVERVIEW: {
        const [
          sales,
          topProducts,
          recentSales,
          inventory,
          activeShifts,
          workers,
        ] = await Promise.all([
          this.prisma.sale.aggregate({
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
              status: 'CLOSED',
            },
            _sum: { totalAmount: true },
            _count: { id: true },
          }),
          this.prisma.saleProduct.groupBy({
            by: ['productId'],
            where: {
              sale: {
                storeId,
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
            },
            _sum: { quantity: true, price: true },
            orderBy: {
              _sum: { quantity: 'desc' },
            },
            take: 5,
          }),
          this.prisma.sale.findMany({
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              worker: {
                select: { fullName: true },
              },
            },
          }),
          this.prisma.product.aggregate({
            where: { storeId },
            _count: { id: true },
          }),
          this.prisma.shift.count({
            where: { storeId, status: 'ACTIVE' },
          }),
          this.prisma.worker.count({
            where: {
              stores: { some: { id: storeId } },
            },
          }),
        ])
        return {
          sales,
          topProducts,
          recentSales,
          inventory,
          activeShifts,
          workers,
        }
      }

      case ReportType.SALES_PERFORMANCE: {
        const [
          salesAgg,
          salesByWorker,
          paymentMethods,
          topProducts,
          dailySalesRaw,
          discounts,
        ] = await Promise.all([
          this.prisma.sale.aggregate({
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
              status: 'CLOSED',
            },
            _sum: {
              totalAmount: true,
              discount: true,
            },
            _count: { id: true },
          }),
          this.prisma.sale.groupBy({
            by: ['workerId'],
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
              status: 'CLOSED',
            },
            _sum: { totalAmount: true },
            _count: { id: true },
          }),
          this.prisma.sale.groupBy({
            by: ['paymentMethod'],
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
              status: 'CLOSED',
            },
            _sum: { totalAmount: true },
          }),
          this.prisma.saleProduct.groupBy({
            by: ['productId'],
            where: {
              sale: {
                storeId,
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
            },
            _sum: { quantity: true, price: true },
            orderBy: {
              _sum: { quantity: 'desc' },
            },
            take: 10,
          }),
          this.prisma.sale.findMany({
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
              status: 'CLOSED',
            },
            select: {
              createdAt: true,
              totalAmount: true,
            },
            orderBy: { createdAt: 'asc' },
          }),
          this.prisma.sale.aggregate({
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
              discount: { gt: 0 },
            },
            _count: { id: true },
            _sum: { discount: true },
          }),
        ])
        return {
          salesAgg,
          salesByWorker,
          paymentMethods,
          topProducts,
          dailySalesRaw,
          discounts,
        }
      }

      case ReportType.WORKER_PERFORMANCE: {
        const workers =
          await this.prisma.worker.findMany({
            where: {
              stores: { some: { id: storeId } },
            },
            include: {
              shifts: {
                where: {
                  createdAt: {
                    gte: start,
                    lte: end,
                  },
                },
                select: {
                  id: true,
                  startTime: true,
                  endTime: true,
                  sales: true,
                  transactionCount: true,
                  status: true,
                },
              },
              sales: {
                where: {
                  createdAt: {
                    gte: start,
                    lte: end,
                  },
                  status: 'CLOSED',
                },
                select: {
                  id: true,
                  totalAmount: true,
                  createdAt: true,
                  worker: {
                    select: { fullName: true },
                  },
                },
              },
            },
          })
        return { workers }
      }

      case ReportType.INVENTORY: {
        const [products, adjustments, pos, tos] =
          await Promise.all([
            this.prisma.product.findMany({
              where: { storeId },
              select: {
                id: true,
                title: true,
                quantity: true,
                minQuantity: true,
                price: true,
                category: {
                  select: { name: true },
                },
                medias: {
                  select: { url: true },
                  take: 1,
                },
              },
              orderBy: { title: 'asc' },
            }),
            this.prisma.inventoryAdjustment.findMany(
              {
                where: {
                  storeId,
                  createdAt: {
                    gte: start,
                    lte: end,
                  },
                },
                take: 20,
                orderBy: { createdAt: 'desc' },
                include: {
                  product: {
                    select: { title: true },
                  },
                },
              },
            ),
            this.prisma.purchaseOrder.findMany({
              where: {
                storeId,
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
              select: {
                id: true,
                status: true,
                createdAt: true,
                _count: {
                  select: { products: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            }),
            this.prisma.transferOrder.findMany({
              where: {
                OR: [
                  { fromStoreId: storeId },
                  { toStoreId: storeId },
                ],
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
              select: {
                id: true,
                status: true,
                createdAt: true,
                fromStore: {
                  select: { name: true },
                },
                toStore: {
                  select: { name: true },
                },
                _count: {
                  select: { products: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            }),
          ])
        return { products, adjustments, pos, tos }
      }

      case ReportType.CLIENT_LOYALTY: {
        const [
          loyaltyProgram,
          topClients,
          pointsTxns,
        ] = await Promise.all([
          this.prisma.loyaltyProgram.findFirst({
            where: {
              businessId: (
                await this.prisma.store.findUnique(
                  {
                    where: { id: storeId },
                  },
                )
              )?.businessId,
            },
          }),
          this.prisma.sale.groupBy({
            by: ['clientId'],
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
              clientId: { not: null },
              status: 'CLOSED',
            },
            _sum: { totalAmount: true },
            _count: { id: true },
            orderBy: {
              _sum: { totalAmount: 'desc' },
            },
            take: 10,
          }),
          this.prisma.pointsTransaction.findMany({
            where: {
              client: {
                sales: {
                  some: {
                    storeId,
                    createdAt: {
                      gte: start,
                      lte: end,
                    },
                  },
                },
              },
              createdAt: { gte: start, lte: end },
            },
            include: {
              client: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 15,
          }),
        ])
        return {
          loyaltyProgram,
          topClients,
          pointsTxns,
        }
      }

      case ReportType.SHIFTS: {
        const shifts =
          await this.prisma.shift.findMany({
            where: {
              storeId,
              createdAt: { gte: start, lte: end },
            },
            include: {
              worker: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true,
                  role: true,
                },
              },
            },
            orderBy: { startTime: 'desc' },
          })
        return { shifts }
      }

      case ReportType.ORDERS_TRANSFERS: {
        const [purchaseOrders, transferOrders] =
          await Promise.all([
            this.prisma.purchaseOrder.findMany({
              where: {
                storeId,
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
              include: {
                products: {
                  include: {
                    product: {
                      select: {
                        title: true,
                        price: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            }),
            this.prisma.transferOrder.findMany({
              where: {
                OR: [
                  { fromStoreId: storeId },
                  { toStoreId: storeId },
                ],
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
              include: {
                fromStore: {
                  select: { name: true },
                },
                toStore: {
                  select: { name: true },
                },
                products: {
                  include: {
                    product: {
                      select: { title: true },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            }),
          ])
        return { purchaseOrders, transferOrders }
      }

      default:
        return {}
    }
  }

  // ─── HTML GENERATORS ────────────────────────────────────────────────────
  private buildReportHTML(
    type: ReportType,
    business: any,
    store: any,
    data: any,
    qrBase64: string,
    period: string,
    start: Date,
    end: Date,
  ): string {
    const header = `
    <div class="header">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div>
          <h1 style="margin:0; font-size:28px; font-weight:700;">${store.name}</h1>
          <p style="margin:4px 0 0; opacity:0.9; font-size:14px;">
            ${business.name} • ${store.address || 'No Address'} • 
            ${start.toLocaleDateString()} to ${end.toLocaleDateString()}
          </p>
        </div>
        <img src="${qrBase64}" style="width:60px; height:60px; border-radius:8px; background:white; padding:4px;" alt="QR" />
      </div>
    </div>
  `

    const css = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      body { font-family: 'Inter', sans-serif; margin:0; padding:0; background:#f8f9fa; color:#1a1a1a; font-size:13px; }
      .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 0 0 12px 12px; margin-bottom: 20px; }
      .card { background: white; border-radius: 10px; padding: 16px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #f3f4f6; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      .metric { background: #fff7ed; border: 1px solid #fed7aa; padding: 12px; border-radius: 8px; text-align: center; }
      .metric-value { font-size: 22px; font-weight: 700; color: #ea580c; }
      .metric-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
      th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e7eb; color: #374151; font-weight: 600; }
      td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
      tr:hover { background: #f9fafb; }
      .tag { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
      .tag-green { background: #d1fae5; color: #059669; }
      .tag-yellow { background: #fef3c7; color: #d97706; }
      .tag-red { background: #fee2e2; color: #dc2626; }
      .tag-blue { background: #dbeafe; color: #2563eb; }
        .footer { text-align: center; padding: 16px; font-size: 11px; color: #6b7280; margin-top: auto; border-top: 1px solid #e5e7eb; }
      .report-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 6px; display: inline-block; }
      .section-title { font-size: 14px; font-weight: 600; color: #374151; margin: 16px 0 8px; }
      .progress-bar { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-top: 4px; }
      .progress-fill { height: 100%; background: linear-gradient(90deg, #f97316, #ea580c); border-radius: 3px; }
      .avatar { width: 28px; height: 28px; border-radius: 50%; background: #f3f4f6; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 8px; }
      .status-badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
      .status-active { background: #d1fae5; color: #059669; }
      .status-completed { background: #dbeafe; color: #2563eb; }
      .status-pending { background: #fef3c7; color: #d97706; }
      .status-cancelled { background: #fee2e2; color: #dc2626; }
    </style>
  `

    let content = ''

    switch (type) {
      case ReportType.STORE_OVERVIEW: {
        const avgTicket =
          data.sales._count.id > 0
            ? (data.sales._sum.totalAmount || 0) /
              data.sales._count.id
            : 0
        content = `
        <div class="report-title">Store Overview Report • ${period.toUpperCase()}</div>
        <div class="grid-4">
          <div class="metric"><div class="metric-value">$${(data.sales._sum.totalAmount || 0).toFixed(2)}</div><div class="metric-label">Total Revenue</div></div>
          <div class="metric"><div class="metric-value">${data.sales._count.id || 0}</div><div class="metric-label">Total Sales</div></div>
          <div class="metric"><div class="metric-value">${data.workers || 0}</div><div class="metric-label">Active Workers</div></div>
          <div class="metric"><div class="metric-value">${data.activeShifts || 0}</div><div class="metric-label">Active Shifts</div></div>
        </div>
        <div class="grid-2">
          <div class="card">
            <h3 class="section-title">Top 5 Selling Products</h3>
            <table>
              <tr><th>Product</th><th>Qty</th><th>Revenue</th></tr>
              ${
                data.topProducts
                  ?.map(
                    (p: any) => `
                <tr>
                  <td>${p.productId?.substring(0, 8)}...</td>
                  <td>${p._sum?.quantity || 0}</td>
                  <td>$${(p._sum?.price || 0).toFixed(2)}</td>
                </tr>
              `,
                  )
                  .join('') ||
                "<tr><td colspan='3'>No data</td></tr>"
              }
            </table>
          </div>
          <div class="card">
            <h3 class="section-title">Recent Sales</h3>
            ${
              data.recentSales
                ?.map(
                  (s: any) => `
              <div style="padding:6px 0; border-bottom:1px solid #f3f4f6; font-size:12px; display:flex; justify-content:space-between;">
                <span><b>$${(s.totalAmount || 0).toFixed(2)}</b> • ${new Date(s.createdAt).toLocaleDateString()}</span>
                <span style="color:#6b7280">${s.worker?.fullName || 'Self'}</span>
              </div>
            `,
                )
                .join('') ||
              "<div style='color:#6b7280'>No recent sales</div>"
            }
          </div>
        </div>
        <div class="card">
          <h3 class="section-title">Inventory Snapshot</h3>
          <div class="grid-3">
            <div style="text-align:center; padding:12px; background:#f0fdf4; border-radius:8px;">
              <div style="font-size:20px; font-weight:700; color:#16a34a">${data.inventory?._count?.id || 0}</div>
              <div style="font-size:11px; color:#6b7280">Total Items</div>
            </div>
            <div style="text-align:center; padding:12px; background:#fffbeb; border-radius:8px;">
              <div style="font-size:20px; font-weight:700; color:#d97706">0</div>
              <div style="font-size:11px; color:#6b7280">Low Stock</div>
            </div>
            <div style="text-align:center; padding:12px; background:#fef2f2; border-radius:8px;">
              <div style="font-size:20px; font-weight:700; color:#dc2626">0</div>
              <div style="font-size:11px; color:#6b7280">Out of Stock</div>
            </div>
          </div>
        </div>
      `
        break
      }

      case ReportType.SALES_PERFORMANCE: {
        const totalSales =
          data.salesAgg?._sum?.totalAmount || 0
        const totalDiscounts =
          data.discounts?._sum?.discount || 0
        content = `
        <div class="report-title">Sales Performance Report • ${period.toUpperCase()}</div>
        <div class="grid-4">
          <div class="metric"><div class="metric-value">$${totalSales.toFixed(2)}</div><div class="metric-label">Total Revenue</div></div>
          <div class="metric"><div class="metric-value">${data.salesAgg?._count?.id || 0}</div><div class="metric-label">Transactions</div></div>
          <div class="metric"><div class="metric-value">$${(totalSales / (data.salesAgg?._count?.id || 1)).toFixed(2)}</div><div class="metric-label">Avg Ticket</div></div>
          <div class="metric"><div class="metric-value">$${totalDiscounts.toFixed(2)}</div><div class="metric-label">Discounts</div></div>
        </div>
        <div class="card">
          <h3 class="section-title">Top 10 Products</h3>
          <table>
            <tr><th>Product</th><th>Qty Sold</th><th>Revenue</th><th>% of Total</th></tr>
            ${
              data.topProducts
                ?.map((p: any) => {
                  const pct =
                    totalSales > 0
                      ? (
                          ((p._sum?.price || 0) /
                            totalSales) *
                          100
                        ).toFixed(1)
                      : 0
                  return `
                <tr>
                  <td>${p.productId?.substring(0, 10)}...</td>
                  <td>${p._sum?.quantity || 0}</td>
                  <td>$${(p._sum?.price || 0).toFixed(2)}</td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:11px">${pct}%</span>
                      <div class="progress-bar" style="width:60px"><div class="progress-fill" style="width:${Math.min(Number(pct), 100)}%"></div></div>
                    </div>
                  </td>
                </tr>
              `
                })
                .join('') ||
              "<tr><td colspan='4'>No data</td></tr>"
            }
          </table>
        </div>
        <div class="grid-2">
          <div class="card">
            <h3 class="section-title">Payment Methods</h3>
            ${
              data.paymentMethods
                ?.map(
                  (pm: any) => `
              <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f3f4f6; font-size:12px;">
                <span>${pm.paymentMethod || 'Unknown'}</span>
                <span><b>$${(pm._sum?.totalAmount || 0).toFixed(2)}</b></span>
              </div>
            `,
                )
                .join('') ||
              "<div style='color:#6b7280'>No payment data</div>"
            }
          </div>
          <div class="card">
            <h3 class="section-title">Sales by Worker</h3>
            ${
              data.salesByWorker
                ?.map(
                  (w: any) => `
              <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f3f4f6; font-size:12px;">
                <span>Worker #${w.workerId?.substring(0, 6)}</span>
                <span><b>$${(w._sum?.totalAmount || 0).toFixed(2)}</b> (${w._count?.id} sales)</span>
              </div>
            `,
                )
                .join('') ||
              "<div style='color:#6b7280'>No worker data</div>"
            }
          </div>
        </div>
      `
        break
      }

      case ReportType.WORKER_PERFORMANCE: {
        content = `
        <div class="report-title">Worker Performance Report • ${period.toUpperCase()}</div>
        <div class="card">
          <table>
            <tr><th>Worker</th><th>Role</th><th>Shifts</th><th>Hours</th><th>Sales</th><th>Avg/Shift</th><th>Completion</th></tr>
            ${
              data.workers
                ?.map((w: any) => {
                  const hours =
                    w.shifts?.reduce(
                      (acc: number, s: any) => {
                        if (!s.endTime) return acc
                        return (
                          acc +
                          (new Date(
                            s.endTime,
                          ).getTime() -
                            new Date(
                              s.startTime,
                            ).getTime()) /
                            3600000
                        )
                      },
                      0,
                    ) || 0
                  const totalSales =
                    w.sales?.reduce(
                      (acc: number, s: any) =>
                        acc +
                        (s.totalAmount || 0),
                      0,
                    ) || 0
                  const completed =
                    w.shifts?.filter(
                      (s: any) =>
                        s.status === 'COMPLETED',
                    ).length || 0
                  const rate =
                    w.shifts?.length > 0
                      ? (
                          (completed /
                            w.shifts.length) *
                          100
                        ).toFixed(0)
                      : 0
                  const avgPerShift =
                    w.shifts?.length > 0
                      ? (
                          totalSales /
                          w.shifts.length
                        ).toFixed(2)
                      : '0.00'
                  const initials =
                    w.fullName
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2) || 'W'
                  return `
                <tr>
                  <td><span class="avatar">${initials}</span>${w.fullName || 'Unknown'}</td>
                  <td><span class="tag tag-blue">${w.role || 'STAFF'}</span></td>
                  <td>${w.shifts?.length || 0}</td>
                  <td>${hours.toFixed(1)}h</td>
                  <td><b>$${totalSales.toFixed(2)}</b></td>
                  <td>$${avgPerShift}</td>
                  <td><span class="${Number(rate) >= 80 ? 'tag-green' : Number(rate) >= 50 ? 'tag-yellow' : 'tag-red'}">${rate}%</span></td>
                </tr>
              `
                })
                .join('') ||
              "<tr><td colspan='7'>No worker data</td></tr>"
            }
          </table>
        </div>
        ${
          data.workers?.some(
            (w: any) => w.shifts?.length > 0,
          )
            ? `
        <div class="card">
          <h3 class="section-title">Shift Details (Last 20)</h3>
          <table>
            <tr><th>Worker</th><th>Date</th><th>Duration</th><th>Sales</th><th>Transactions</th><th>Status</th></tr>
            ${
              data.workers
                ?.flatMap(
                  (w: any) => w.shifts || [],
                )
                .slice(0, 20)
                .map((s: any) => {
                  const duration = s.endTime
                    ? Math.round(
                        (new Date(
                          s.endTime,
                        ).getTime() -
                          new Date(
                            s.startTime,
                          ).getTime()) /
                          60000,
                      ) + ' min'
                    : 'Active'
                  const statusClass =
                    s.status === 'COMPLETED'
                      ? 'status-completed'
                      : s.status === 'ACTIVE'
                        ? 'status-active'
                        : 'status-pending'
                  return `
                <tr>
                  <td style="font-size:11px">${s.worker.fullName?.split(' ')[0] || 'Unknown'}</td>
                  <td>${new Date(s.startTime).toLocaleDateString()}</td>
                  <td>${duration}</td>
                  <td><b>$${(s.sales || 0).toFixed(2)}</b></td>
                  <td>${s.transactionCount || 0}</td>
                  <td><span class="status-badge ${statusClass}">${s.status}</span></td>
                </tr>
              `
                })
                .join('') ||
              "<tr><td colspan='6'>No shift data</td></tr>"
            }
          </table>
        </div>`
            : ''
        }
      `
        break
      }

      case ReportType.INVENTORY: {
        const inStock =
          data.products?.filter(
            (p: any) =>
              p.quantity >= (p.minQuantity || 10),
          ).length || 0
        const lowStock =
          data.products?.filter(
            (p: any) =>
              p.quantity > 0 &&
              p.quantity < (p.minQuantity || 10),
          ).length || 0
        const outOfStock =
          data.products?.filter(
            (p: any) => p.quantity === 0,
          ).length || 0
        content = `
        <div class="report-title">Inventory Status Report • ${period.toUpperCase()}</div>
        <div class="grid-3">
          <div class="metric"><div class="metric-value">${inStock}</div><div class="metric-label">In Stock</div></div>
          <div class="metric"><div class="metric-value">${lowStock}</div><div class="metric-label">Low Stock</div></div>
          <div class="metric"><div class="metric-value">${outOfStock}</div><div class="metric-label">Out of Stock</div></div>
        </div>
        <div class="card">
          <h3 class="section-title">Full Inventory (${data.products?.length || 0} items)</h3>
          <table>
            <tr><th>Product</th><th>Category</th><th>Stock</th><th>Min</th><th>Price</th><th>Status</th></tr>
            ${
              data.products
                ?.map((p: any) => {
                  const status =
                    p.quantity === 0
                      ? 'OUT'
                      : p.quantity <
                          (p.minQuantity || 10)
                        ? 'LOW'
                        : 'OK'
                  const statusTag =
                    status === 'OK'
                      ? 'tag-green'
                      : status === 'LOW'
                        ? 'tag-yellow'
                        : 'tag-red'
                  return `
                <tr>
                  <td style="font-weight:500">${p.title}</td>
                  <td style="font-size:11px; color:#6b7280">${p.category?.name || 'Uncategorized'}</td>
                  <td><b>${p.quantity}</b></td>
                  <td>${p.minQuantity || 10}</td>
                  <td>$${(p.price || 0).toFixed(2)}</td>
                  <td><span class="tag ${statusTag}">${status}</span></td>
                </tr>
              `
                })
                .join('') ||
              "<tr><td colspan='6'>No inventory data</td></tr>"
            }
          </table>
        </div>
        <div class="grid-2">
          <div class="card">
            <h3 class="section-title">Recent Adjustments</h3>
            ${
              data.adjustments
                ?.map(
                  (a: any) => `
              <div style="padding:6px 0; border-bottom:1px solid #f3f4f6; font-size:12px;">
                <div style="display:flex; justify-content:space-between;">
                  <span style="font-weight:500">${a.product?.title || 'Unknown'}</span>
                  <span class="tag ${a.adjustmentType === 'ADD' || a.adjustmentType === 'RESTOCK' ? 'tag-green' : 'tag-red'}">
                    ${a.adjustmentType} ${a.quantity > 0 ? '+' + a.quantity : a.quantity}
                  </span>
                </div>
                <div style="color:#6b7280; font-size:11px; margin-top:2px;">
                  ${a.reason || 'No reason'} • ${new Date(a.createdAt).toLocaleDateString()}
                </div>
              </div>
            `,
                )
                .join('') ||
              "<div style='color:#6b7280'>No adjustments</div>"
            }
          </div>
          <div class="card">
            <h3 class="section-title">Orders Summary</h3>
            <div style="margin-bottom:12px;">
              <div style="font-size:11px; color:#6b7280; margin-bottom:4px;">Purchase Orders</div>
              ${
                data.pos
                  ?.map(
                    (po: any) => `
                <div style="display:flex; justify-content:space-between; font-size:12px; padding:4px 0;">
                  <span>#${po.id.substring(0, 6)}</span>
                  <span><span class="status-badge status-${po.status.toLowerCase()}">${po.status}</span> • ${po._count?.products} items</span>
                </div>
              `,
                  )
                  .join('') ||
                "<div style='color:#6b7280; font-size:12px'>No POs</div>"
              }
            </div>
            <div>
              <div style="font-size:11px; color:#6b7280; margin-bottom:4px;">Transfer Orders</div>
              ${
                data.tos
                  ?.map(
                    (to: any) => `
                <div style="display:flex; justify-content:space-between; font-size:12px; padding:4px 0;">
                  <span>#${to.id.substring(0, 6)}</span>
                  <span><span class="status-badge status-${to.status.toLowerCase()}">${to.status}</span> • ${to._count?.products} items</span>
                </div>
              `,
                  )
                  .join('') ||
                "<div style='color:#6b7280; font-size:12px'>No TOs</div>"
              }
            </div>
          </div>
        </div>
      `
        break
      }

      case ReportType.CLIENT_LOYALTY: {
        content = `
        <div class="report-title">Client & Loyalty Report • ${period.toUpperCase()}</div>
        ${
          data.loyaltyProgram
            ? `
        <div class="card" style="background:linear-gradient(135deg, #fff7ed, #ffedd5); border:1px solid #fed7aa;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin:0; color:#ea580c;">${data.loyaltyProgram.name}</h3>
              <p style="margin:4px 0 0; font-size:12px; color:#6b7280;">${data.loyaltyProgram.description || 'No description'}</p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:20px; font-weight:700; color:#ea580c;">${data.loyaltyProgram.pointsPerPurchase} pts/$</div>
              <div style="font-size:11px; color:#6b7280;">Earn Rate</div>
            </div>
          </div>
        </div>`
            : ''
        }
        <div class="card">
          <h3 class="section-title">Top 10 Clients</h3>
          <table>
            <tr><th>Client</th><th>Total Spent</th><th>Visits</th><th>Avg Order</th><th>Est. Points</th></tr>
            ${
              data.topClients
                ?.map((c: any) => {
                  const avgOrder =
                    c._count?.id > 0
                      ? (c._sum?.totalAmount ||
                          0) / c._count.id
                      : 0
                  const estPoints =
                    (c._sum?.totalAmount || 0) *
                    (data.loyaltyProgram
                      ?.pointsPerPurchase || 0)
                  return `
                <tr>
                  <td style="font-weight:500">Client #${c.clientId?.substring(0, 8)}</td>
                  <td><b>$${(c._sum?.totalAmount || 0).toFixed(2)}</b></td>
                  <td>${c._count?.id || 0}</td>
                  <td>$${avgOrder.toFixed(2)}</td>
                  <td><span class="tag tag-blue">${estPoints.toFixed(0)} pts</span></td>
                </tr>
              `
                })
                .join('') ||
              "<tr><td colspan='5'>No client data</td></tr>"
            }
          </table>
        </div>
        <div class="card">
          <h3 class="section-title">Recent Points Transactions</h3>
          <table>
            <tr><th>Client</th><th>Type</th><th>Points</th><th>Date</th></tr>
            ${
              data.pointsTxns
                ?.map(
                  (pt: any) => `
              <tr>
                <td style="font-size:12px">${pt.client?.fullName?.split(' ')[0] || 'Unknown'}</td>
                <td><span class="tag ${pt.type === 'EARNED' ? 'tag-green' : 'tag-red'}">${pt.type}</span></td>
                <td><b>${pt.type === 'EARNED' ? '+' : '-'}${pt.points?.toFixed(0)}</b></td>
                <td style="font-size:11px; color:#6b7280">${new Date(pt.createdAt).toLocaleDateString()}</td>
              </tr>
            `,
                )
                .join('') ||
              "<tr><td colspan='4'>No points transactions</td></tr>"
            }
          </table>
        </div>
      `
        break
      }

      case ReportType.SHIFTS: {
        content = `
        <div class="report-title">Shifts Report • ${period.toUpperCase()}</div>
        <div class="card">
          <table>
            <tr><th>Worker</th><th>Role</th><th>Start</th><th>End</th><th>Duration</th><th>Sales</th><th>Transactions</th><th>Status</th></tr>
            ${
              data.shifts
                ?.map((s: any) => {
                  const duration = s.endTime
                    ? Math.round(
                        (new Date(
                          s.endTime,
                        ).getTime() -
                          new Date(
                            s.startTime,
                          ).getTime()) /
                          60000,
                      ) + ' min'
                    : 'Active'
                  const statusClass =
                    s.status === 'COMPLETED'
                      ? 'status-completed'
                      : s.status === 'ACTIVE'
                        ? 'status-active'
                        : 'status-pending'
                  const initials =
                    s.worker?.fullName
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2) || 'W'
                  return `
                <tr>
                  <td><span class="avatar">${initials}</span>${s.worker?.fullName || 'Unknown'}</td>
                  <td style="font-size:11px">${s.worker?.role || 'STAFF'}</td>
                  <td style="font-size:11px">${new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style="font-size:11px">${s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td style="font-size:11px">${duration}</td>
                  <td><b>$${(s.sales || 0).toFixed(2)}</b></td>
                  <td>${s.transactionCount || 0}</td>
                  <td><span class="status-badge ${statusClass}">${s.status}</span></td>
                </tr>
              `
                })
                .join('') ||
              "<tr><td colspan='8'>No shift data</td></tr>"
            }
          </table>
        </div>
        ${
          data.shifts?.length > 0
            ? `
        <div class="grid-3" style="margin-top:12px;">
          <div class="metric">
            <div class="metric-value">${data.shifts?.filter((s: any) => s.status === 'COMPLETED').length || 0}</div>
            <div class="metric-label">Completed</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.shifts?.filter((s: any) => s.status === 'ACTIVE').length || 0}</div>
            <div class="metric-label">Active Now</div>
          </div>
          <div class="metric">
            <div class="metric-value">$${(data.shifts?.reduce((acc: number, s: any) => acc + (s.sales || 0), 0) || 0).toFixed(2)}</div>
            <div class="metric-label">Total Shift Sales</div>
          </div>
        </div>`
            : ''
        }
      `
        break
      }

      case ReportType.ORDERS_TRANSFERS: {
        content = `
        <div class="report-title">Orders & Transfers Report • ${period.toUpperCase()}</div>
        <div class="grid-2">
          <div class="card">
            <h3 class="section-title">Purchase Orders (${data.purchaseOrders?.length || 0})</h3>
            ${
              data.purchaseOrders
                ?.map(
                  (po: any) => `
              <div style="padding:10px; margin:8px 0; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span style="font-weight:600">PO #${po.id.substring(0, 8)}</span>
                  <span class="status-badge status-${po.status.toLowerCase()}">${po.status}</span>
                </div>
                <div style="font-size:11px; color:#6b7280; margin-bottom:6px;">
                  Created: ${new Date(po.createdAt).toLocaleDateString()}
                </div>
                <div style="font-size:12px;">
                  <b>${po._count?.products || 0} items</b>
                  ${po.products
                    ?.slice(0, 3)
                    .map(
                      (pp: any) => `
                    <div style="font-size:11px; color:#6b7280; margin-top:2px;">• ${pp.product?.title} ×${pp.quantity}</div>
                  `,
                    )
                    .join('')}
                  ${po.products?.length > 3 ? `<div style="font-size:11px; color:#6b7280; font-style:italic">+${po.products.length - 3} more</div>` : ''}
                </div>
              </div>
            `,
                )
                .join('') ||
              "<div style='color:#6b7280; text-align:center; padding:20px'>No purchase orders</div>"
            }
          </div>
          <div class="card">
            <h3 class="section-title">Transfer Orders (${data.transferOrders?.length || 0})</h3>
            ${
              data.transferOrders
                ?.map(
                  (to: any) => `
              <div style="padding:10px; margin:8px 0; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span style="font-weight:600">TO #${to.id.substring(0, 8)}</span>
                  <span class="status-badge status-${to.status.toLowerCase()}">${to.status}</span>
                </div>
                <div style="font-size:11px; color:#6b7280; margin-bottom:6px;">
                  ${to.fromStore?.name} → ${to.toStore?.name} • ${new Date(to.createdAt).toLocaleDateString()}
                </div>
                <div style="font-size:12px;">
                  <b>${to._count?.products || 0} items transferred</b>
                  ${to.products
                    ?.slice(0, 3)
                    .map(
                      (tp: any) => `
                    <div style="font-size:11px; color:#6b7280; margin-top:2px;">• ${tp.product?.title}</div>
                  `,
                    )
                    .join('')}
                  ${to.products?.length > 3 ? `<div style="font-size:11px; color:#6b7280; font-style:italic">+${to.products.length - 3} more</div>` : ''}
                </div>
              </div>
            `,
                )
                .join('') ||
              "<div style='color:#6b7280; text-align:center; padding:20px'>No transfer orders</div>"
            }
          </div>
        </div>
      `
        break
      }

      default:
        content = `<div class="card">Report type "${type}" is not yet implemented. Please contact support.</div>`
    }

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report - ${store.name}</title>${css}</head><body style="padding:20px; min-height:100vh; display:flex; flex-direction:column;">${header}<div style="max-width:800px; margin:0 auto;">${content}</div><div class="footer">Uscor Marketplace • Powered by Uscor Tech • support@uscor.rw • +250 790 802 201<br/>Report generated on ${new Date().toLocaleString()}</div></body></html>`
  }
}
