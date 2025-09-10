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
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.business.findUnique({
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
            media: {
              take: 1,
              select: {
                url: true,
              },
            },
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
      },
    })
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
