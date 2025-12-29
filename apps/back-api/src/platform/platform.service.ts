import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdatePlatformSettingsInput } from './dto/update-platform-settings.input'
import { PubSub } from 'graphql-subscriptions'

@Injectable()
export class PlatformService {
  constructor(
    private prisma: PrismaService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async getPlatformSettings() {
    const client = this.prisma as any
    let settings = await client.platformSettings.findFirst()
    if (!settings) {
      // Create a default row to ensure the query is non-nullable for clients
      settings = await client.platformSettings.create({ data: {
        platformFeePercentage: 0,
        minTransactionAmount: 0,
        maxTransactionAmount: 0,
        currency: 'USD',
        tokenValue: 0,
        tokenSymbol: null,
        kycRequired: true,
        b2bEnabled: false,
        marketplaceEnabled: true,
      } })
    }
    return settings
  }

  async updatePlatformSettings(input: UpdatePlatformSettingsInput) {
    const client = this.prisma as any
    const existing = await client.platformSettings.findFirst()
    let updated
    if (existing) {
      updated = await client.platformSettings.update({ where: { id: existing.id }, data: { ...input } })
    } else {
      updated = await client.platformSettings.create({ data: { ...input } })
    }
    await this.pubSub.publish('PLATFORM_SETTINGS_UPDATED', { platformSettingsUpdated: updated })
    return updated
  }

  async getPlatformMetrics() {
    const client = this.prisma as any
    const [totalUsers, totalBusinesses, totalProducts, totalServices] = await Promise.all([
      client.client.count(),
      client.business.count(),
      client.product.count(),
      client.freelanceService.count(),
    ])

    const totalTransactions = await client.paymentTransaction.count({ where: { status: 'COMPLETED' } })
    const revenueRes = await client.paymentTransaction.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } })
    const totalRevenue = revenueRes._sum.amount || 0

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const activeUsersToday = await client.client.count({ where: { OR: [{ lastLogin: { gte: since24h } }, { createdAt: { gte: since24h } }] } })
    const activeBusinessesToday = await client.business.count({ where: { OR: [{ lastLogin: { gte: since24h } }, { createdAt: { gte: since24h } }] } })

    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // KYC counts
    const [kycPendingCount, kycVerifiedCount, kycRejectedCount] = await Promise.all([
      client.business.count({ where: { kycStatus: 'PENDING' } }),
      client.business.count({ where: { kycStatus: 'VERIFIED' } }),
      client.business.count({ where: { kycStatus: 'REJECTED' } }),
    ])

    // Disputes
    const [disputesOpenCount, disputesResolvedCount] = await Promise.all([
      client.dispute.count({ where: { status: 'OPEN' } }),
      client.dispute.count({ where: { status: 'RESOLVED' } }),
    ])

    // Ads counts
    const [adsActiveCount, adsPendingCount] = await Promise.all([
      client.ad.count({ where: { endedAt: null } }),
      client.ad.count({ where: { endedAt: { not: null } } }),
    ])

    // Build daily counts for transactions for last 30 days, 7 days, 24 hours (24 hourly buckets)
    const last30Days: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - i)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      const cnt = await client.paymentTransaction.count({ where: { createdAt: { gte: start, lt: end }, status: 'COMPLETED' } })
      last30Days.push({ date: start.toISOString().split('T')[0], count: cnt })
    }

    const last7Days = last30Days.slice(23, 30) // last 7 days

    // last24Hours hourly counts
    const last24Hours: { date: string; count: number }[] = []
    for (let i = 23; i >= 0; i--) {
      const start = new Date(Date.now() - i * 60 * 60 * 1000)
      start.setMinutes(0, 0, 0)
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      const cnt = await client.paymentTransaction.count({ where: { createdAt: { gte: start, lt: end }, status: 'COMPLETED' } })
      last24Hours.push({ date: start.toISOString(), count: cnt })
    }

    return {
      totalUsers,
      totalBusinesses,
      totalProducts,
      totalServices,
      totalTransactions,
      totalRevenue,
      activeUsersToday,
      activeBusinessesToday,
      averageTransactionValue,
      platformFeesCollected: 0,
      kycPendingCount,
      kycVerifiedCount,
      kycRejectedCount,
      disputesOpenCount,
      disputesResolvedCount,
      adsActiveCount,
      adsPendingCount,
      last24Hours,
      last7Days,
      last30Days,
    }
  }
}
