import { Injectable } from '@nestjs/common'
import { CreateBusinessInput } from './dto/create-business.input'
import { UpdateBusinessInput } from './dto/update-business.input'
import { PrismaService } from '../prisma/prisma.service'
import { hash } from 'argon2'
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { BusinessDashboardResponse } from './entities/business-dashboard.entity'
import { DashboardStats } from './entities/business-dashboard-stats.entity'
import { SalesDataPoint } from './entities/sales-data-points.entity'
import { RecentOrder } from './entities/business-recent-order.entity'

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBusinessInput: CreateBusinessInput,
  ) {
    const { password, ...businessData } =
      createBusinessInput
    const hashedPassword = await hash(password)

    return this.prisma.business.create({
      data: {
        ...businessData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        avatar: true,
        coverImage: true,
        address: true,
        phone: true,
        isVerified: true,
        isB2BEnabled: true,
        kycStatus: true,
        hasAgreedToTerms: true,
        totalProductsSold: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findAll() {
    return this.prisma.business.findMany({
      include: {
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            stock: true,
            createdAt: true,
          },
        },
        workers: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
          },
        },
        repostedItems: {
          select: {
            id: true,
            markupPercentage: true,
            createdAt: true,
          },
        },
        reownedItems: {
          select: {
            id: true,
            oldPrice: true,
            newPrice: true,
            markupPercentage: true,
            createdAt: true,
          },
        },
        recharges: {
          select: {
            id: true,
            amount: true,
            method: true,
            createdAt: true,
          },
        },
        ads: {
          select: {
            id: true,
            price: true,
            periodDays: true,
            createdAt: true,
            endedAt: true,
          },
        },
        freelanceServices: {
          select: {
            id: true,
            title: true,
            isHourly: true,
            rate: true,
            createdAt: true,
          },
        },
        referralsMade: {
          select: {
            id: true,
            verifiedPurchase: true,
            createdAt: true,
          },
        },
        referralsReceived: {
          select: {
            id: true,
            verifiedPurchase: true,
            createdAt: true,
          },
        },
        chatParticipants: {
          select: {
            chat: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        // Include payment & hardware config for frontend settings
        paymentConfig: true,
        hardwareConfig: true,
        // Include KYC documents (multiple) as frontend expects 'kyc' list
        kycDocuments: {
          select: {
            id: true,
            documentUrl: true,
            documentType: true,
            status: true,
            submittedAt: true,
            verifiedAt: true,
          },
        },
        // Include stores with nested products and product medias
        stores: {
          select: {
            id: true,
            name: true,
            address: true,
            products: {
              select: {
                id: true,
                title: true,
                price: true,
                medias: {
                  select: { url: true },
                },
              },
            },
          },
        },
        postOfSales: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            createdAt: true,
          },
        },
        kyc: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            verifiedAt: true,
          },
        },
      } as any,
    })
  }

  async findOne(id: string) {
    const business: any = await this.prisma.business.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            quantity: true,
            // minQuantity: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        workers: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatar: true,
            role: true,
            createdAt: true,
          },
        },
        repostedItems: {
          select: {
            id: true,
            markupPercentage: true,
            createdAt: true,
            product: {
              select: {
                title: true,
                price: true,
                medias: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        reownedItems: {
          select: {
            id: true,
            oldPrice: true,
            newPrice: true,
            markupPercentage: true,
            createdAt: true,
            newProduct: {
              select: {
                title: true,
                price: true,
                medias: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        recharges: {
          select: {
            id: true,
            amount: true,
            method: true,
            createdAt: true,
          },
        },
        ads: {
          select: {
            id: true,
            price: true,
            periodDays: true,
            createdAt: true,
            endedAt: true,
            product: {
              select: {
                title: true,
                medias: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        freelanceServices: {
          select: {
            id: true,
            title: true,
            isHourly: true,
            rate: true,
            createdAt: true,
            category: true,
          },
        },
        referralsMade: {
          select: {
            id: true,
            verifiedPurchase: true,
            createdAt: true,
            referredClient: {
              select: {
                fullName: true,
              },
            },
          },
        },
        referralsReceived: {
          select: {
            id: true,
            verifiedPurchase: true,
            createdAt: true,
            affiliateClient: {
              select: {
                fullName: true,
              },
            },
          },
        },
        chatParticipants: {
          select: {
            chat: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,

                product: {
                  select: {
                    title: true,
                  },
                },
              },
            },
            client: {
              select: {
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        postOfSales: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            createdAt: true,
          },
        },
        kyc: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            verifiedAt: true,
          },
        },
        stores: {
          select: {
            id: true,
            name: true,
            address: true,
            createdAt: true,
            products: {
              select: {
                id: true,
                title: true,
                price: true,
                quantity: true,
                medias: { select: { url: true, type: true } },
                store: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        loyaltyPrograms: {
          select: {
            id: true,
            name: true,
            pointsPerPurchase: true,
            // minimumPointsToRedeem: true,
            createdAt: true,
          },
        },
      } as any,
    })

    // Normalize store product shapes
    if (business && business.stores) {
      business.stores = business.stores.map((s: any) => ({
        ...s,
        products: (s.products || []).map((p: any) => this.normalizeProduct(p)),
      }))
    }

    return business
  }

  async updateTotalProuctSold(
    id: string,
    data: {
      totalProductsSold?: { increment: number }
    },
  ) {
    await this.prisma.business.update({
      where: { id },
      data,
    })
  }

  async update(
    id: string,
    updateBusinessInput: UpdateBusinessInput,
  ) {
    const { password, kycId, ...businessData } =
      updateBusinessInput
    const data: any = { ...businessData }

    if (password) {
      data.password = await hash(password)
    }
    if (kycId) {
      data.kyc = { connect: { id: kycId } }
    }

    return this.prisma.business.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        avatar: true,
        coverImage: true,
        address: true,
        phone: true,
        isVerified: true,
        isB2BEnabled: true,
        kycStatus: true,
        hasAgreedToTerms: true,
        totalProductsSold: true,
        createdAt: true,
        updatedAt: true,
        kyc: {
          select: { id: true, status: true },
        },
      },
    })
  }

  async remove(id: string) {
    return this.prisma.business.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  }

  async verifyBusinessAccess(
    businessId: string | undefined | null,
    user: { id: string; role: string },
  ) {
    const business = this.findOne(user.id)

    if (!business) {
      throw new Error(
        'Worker can only access stores of their business',
      )
    }

    return true
  }

  async getBusinessDashboard(
    businessId: string,
  ): Promise<BusinessDashboardResponse> {
    const [stats, salesData, recentOrders] =
      await Promise.all([
        this.getDashboardStats(businessId),
        this.getSalesData(businessId),
        this.getRecentOrders(businessId),
      ])

    return { stats, salesData, recentOrders }
  }

  // New API: get products for a business with optional store/category/search filters
  // Normalizes a product returned from Prisma to the shape expected by the frontend
  private normalizeProduct(product: any) {
    const media = product.medias && product.medias.length ? product.medias[0] : null
    return {
      id: product.id,
      name: product.title || product.name || '',
      description: product.description || null,
      price: product.price || 0,
      category: product.category || null,
      stockQuantity: product.quantity ?? product.stock ?? 0,
      media,
      store: product.store ? { id: product.store.id, name: product.store.name } : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }

  async getProducts(opts: {
    businessId: string
    storeId?: string
    category?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const { businessId, storeId, category, search, page = 1, limit = 50 } = opts
    const where: any = { businessId }
    if (storeId) where.storeId = storeId
    if (category) where.category = category
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]

    const products = await this.prisma.product.findMany({
      where,
      include: {
        medias: { select: { url: true, type: true } },
        store: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      } as any,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Map to frontend shape (name, stockQuantity, media)
    return products.map((p: any) => this.normalizeProduct(p))
  }

  // New API: paginated businesses listing with filters and optional promotion/loyalty enrichment
  async getBusinesses(opts: {
    search?: string
    businessType?: string
    hasLoyalty?: boolean
    hasPromotions?: boolean
    isB2BEnabled?: boolean
    isVerified?: boolean
    sort?: string
    page?: number
    limit?: number
  }) {
    const {
      search,
      businessType,
      hasLoyalty,
      hasPromotions,
      isB2BEnabled,
      isVerified,
      sort,
      page = 1,
      limit = 12,
    } = opts

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (businessType) where.businessType = businessType
    if (typeof isB2BEnabled === 'boolean') where.isB2BEnabled = isB2BEnabled
    if (typeof isVerified === 'boolean') where.isVerified = isVerified
    if (typeof hasLoyalty === 'boolean' && hasLoyalty) where.loyaltyPrograms = { some: {} }

    // If hasPromotions requested, resolve business ids that have promotions and filter by them
    if (typeof hasPromotions === 'boolean' && hasPromotions) {
      const promos = await this.prisma.promotion.findMany({
        select: { applicableBusinesses: { select: { id: true } } },
      })
      const bizIds = new Set<string>()
      for (const p of promos) {
        for (const b of p.applicableBusinesses || []) bizIds.add(b.id)
      }
      if (bizIds.size === 0) {
        // return empty page
        return { items: [], total: 0, page, limit }
      }
      where.id = { in: Array.from(bizIds) }
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    else if (sort === 'top') orderBy = { totalProductsSold: 'desc' }
    else if (sort === 'revenue') orderBy = { totalRevenueGenerated: 'desc' }

    const [total, items] = await Promise.all([
      this.prisma.business.count({ where }),
      this.prisma.business.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          stores: { select: { id: true, name: true, address: true } },
          workers: { select: { id: true, fullName: true, avatar: true, role: true } },
          freelanceServices: { select: { id: true, title: true, description: true, isHourly: true, rate: true, category: true } },
          kyc: { select: { id: true, status: true, documentUrl: true, submittedAt: true, verifiedAt: true } },
          loyaltyPrograms: { select: { id: true, name: true, pointsPerPurchase: true } },
        } as any,
      }),
    ])

    const businessIds = items.map((b: any) => b.id)

    // Fetch promotions for these businesses in bulk to avoid N+1
    let promotions: any[] = []
    if (businessIds.length) {
      promotions = await this.prisma.promotion.findMany({
        where: { applicableBusinesses: { some: { id: { in: businessIds } } } },
        select: { id: true, title: true, description: true, startDate: true, endDate: true, applicableBusinesses: { select: { id: true } } },
      })
    }

    const promosByBusiness: Record<string, any[]> = {}
    for (const p of promotions) {
      for (const b of p.applicableBusinesses || []) {
        promosByBusiness[b.id] = promosByBusiness[b.id] || []
        promosByBusiness[b.id].push({ id: p.id, title: p.title, description: p.description, startDate: p.startDate, endDate: p.endDate })
      }
    }

    // Map first loyaltyProgram to `loyaltyProgram` and attach promotions
    const mapped = items.map((b: any) => ({
      ...b,
      loyaltyProgram: b.loyaltyPrograms && b.loyaltyPrograms.length ? { id: b.loyaltyPrograms[0].id, name: b.loyaltyPrograms[0].name, pointsPerDollar: b.loyaltyPrograms[0].pointsPerPurchase } : null,
      promotions: promosByBusiness[b.id] || [],
    }))

    return { items: mapped, total, page, limit }
  }

  async getBusinessTypes() {
    return this.prisma.businessType.findMany({ orderBy: { name: 'asc' } })
  }

  // New API: get freelance services for a business (with optional filters)
  async getServices(opts: { businessId: string; category?: string; search?: string; page?: number; limit?: number }) {
    const { businessId, category, search, page = 1, limit = 50 } = opts
    const where: any = { businessId }
    if (category) where.category = category
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]

    const services = await this.prisma.freelanceService.findMany({
      where,
      include: {
        workerServiceAssignments: { include: { worker: { select: { fullName: true, avatar: true } } } },
      } as any,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return services
  }

  // New API: get reviews for a business with pagination
  async getReviews(businessId: string, page = 1, limit = 10) {
    // Reviews are linked to products; fetch product ids then reviews
    const productIds = await this.prisma.product.findMany({ where: { businessId }, select: { id: true } })
    const ids = productIds.map((p) => p.id)

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId: { in: ids } },
        include: { client: { select: { id: true, fullName: true, avatar: true } } } as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where: { productId: { in: ids } } }),
    ])

    return {
      items,
      total,
      page,
      limit,
    }
  }

  private async getDashboardStats(
    businessId: string,
  ): Promise<DashboardStats> {
    const today = new Date()
    const startOfCurrentMonth =
      startOfMonth(today)
    const endOfCurrentMonth = endOfMonth(today)
    const startOfPreviousMonth = startOfMonth(
      subDays(today, 30),
    )
    const endOfPreviousMonth = endOfMonth(
      subDays(today, 30),
    )

    // Single query for all order-related metrics
    const [
      currentWeekMetrics,
      previousWeekMetrics,
      productMetrics,
      messageMetrics,
    ] = await Promise.all([
      // Current week revenue and order count in one query
      this.prisma.order.aggregate({
        where: {
          products: {
            some: {
              product: { businessId },
            },
          },
          payment: { status: 'COMPLETED' },
          // createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth }
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Previous week revenue and order count in one query
      this.prisma.order.aggregate({
        where: {
          products: {
            some: {
              product: { businessId },
            },
          },
          payment: { status: 'COMPLETED' },
          // createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth }
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Product metrics in one query
      this.prisma.product.aggregate({
        where: { businessId },
        _count: {
          id: true,
          quantity: true, // Low stock count
        },
      }),

      // Message metrics in one query
      this.prisma.chatMessage.aggregate({
        where: {
          chat: {
            participants: {
              some: { businessId },
            },
          },
          isRead: { equals: false },
        },
        _count: {
          id: true,
          isRead: true, // Unread count
        },
      }),
    ])

    // Calculate changes
    const current_week_metrics =
      currentWeekMetrics._sum.totalAmount || 0
    const previous_week_metrics =
      previousWeekMetrics._sum.totalAmount || 0

    const totalRevenue = current_week_metrics
    const previousRevenue = previous_week_metrics
    const revenueChange = previousRevenue
      ? ((totalRevenue - previousRevenue) /
          previousRevenue) *
        100
      : 100

    const totalOrders = currentWeekMetrics._count
    const previousOrders =
      previousWeekMetrics._count
    const ordersChange = previousOrders
      ? ((totalOrders - previousOrders) /
          previousOrders) *
        100
      : 100

    console.log('Revenues: ', {
      totalRevenue,
      previousOrders,
    })

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      totalProducts: productMetrics._count
        ? productMetrics._count.id
        : 0,
      lowStockProducts: productMetrics._count
        ? productMetrics._count.quantity
        : 0,
      unreadMessages:
        messageMetrics._count.isRead,
      totalMessages: messageMetrics._count.id,
    }
  }

  private async getSalesData(
    businessId: string,
  ): Promise<SalesDataPoint[]> {
    const sevenDaysAgo = subDays(new Date(), 7)

    // Single query with proper date truncation for grouping
    const dailySales = await this.prisma
      .$queryRaw<
      Array<{
        date: Date
        total: number
      }>
    >`
      SELECT 
        DATE(o."createdAt") as date,
        COALESCE(SUM(o."totalAmount"), 0)::float as total
      FROM "Order" o
      INNER JOIN "OrderProduct" op ON o.id = op."orderId"
      INNER JOIN "Product" p ON op."productId" = p.id
      INNER JOIN "PaymentTransaction" pt ON o.id = pt."orderId"
      WHERE 
        p."businessId" = ${businessId}
        AND pt.status = 'COMPLETED'
        AND o."createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE(o."createdAt")
      ORDER BY date ASC
    `

    // Create complete 7-day array
    const salesData: SalesDataPoint[] = []
    let currentDate = new Date(sevenDaysAgo)

    while (currentDate <= new Date()) {
      const dateStr = format(
        currentDate,
        'yyyy-MM-dd',
      )
      const daySale = dailySales.find(
        (s) =>
          format(s.date, 'yyyy-MM-dd') ===
          dateStr,
      )

      salesData.push({
        date: format(currentDate, 'EEE'),
        sales: daySale?.total || 0,
      })

      currentDate = addDays(currentDate, 1)
    }

    return salesData.slice(0, 7) // Ensure exactly 7 days
  }

  private async getRecentOrders(
    businessId: string,
  ): Promise<RecentOrder[]> {
    // Single optimized query with only needed fields
    const orders =
      await this.prisma.order.findMany({
        where: {
          products: {
            some: {
              product: { businessId },
            },
          },
          payment: { status: 'COMPLETED' },
        },
        select: {
          id: true,
          createdAt: true,
          totalAmount: true,
          client: {
            select: {
              id: true,
              fullName: true,
            },
          },
          payment: {
            select: {
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

    return orders.map((order) => ({
      id: order.id,
      client: {
        id: order.client.id,
        fullName:
          order.client.fullName || 'No Full Name',
      },
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      status:
        order.payment?.status || 'No Status',
    }))
  }
}
