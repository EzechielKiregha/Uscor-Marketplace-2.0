import {
  Inject,
  Injectable,
} from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { sumPrecise } from '../common/token-math'
import { PrismaService } from '../prisma/prisma.service'
import { UpdatePlatformSettingsInput } from './dto/update-platform-settings.input'

@Injectable()
export class PlatformService {
  constructor(
    private prisma: PrismaService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async getPlatformSettings() {
    const client = this.prisma as any
    let settings =
      await client.platformSettings.findFirst()
    if (!settings) {
      // Create a default row to ensure the query is non-nullable for clients
      settings =
        await client.platformSettings.create({
          data: {
            platformFeePercentage: 0,
            minTransactionAmount: 0,
            maxTransactionAmount: 0,
            currency: 'USD',
            tokenValue: 0,
            tokenSymbol: null,
            kycRequired: true,
            b2bEnabled: false,
            marketplaceEnabled: true,
          },
        })
    }
    return settings
  }

  async updatePlatformSettings(
    input: UpdatePlatformSettingsInput,
  ) {
    const client = this.prisma as any
    const existing =
      await client.platformSettings.findFirst()
    let updated
    if (existing) {
      updated =
        await client.platformSettings.update({
          where: { id: existing.id },
          data: { ...input },
        })
    } else {
      updated =
        await client.platformSettings.create({
          data: { ...input },
        })
    }
    await this.pubSub.publish(
      'PLATFORM_SETTINGS_UPDATED',
      {
        platformSettingsUpdated: updated,
      },
    )
    return updated
  }

  async getPlatformMetrics() {
    const client = this.prisma as any

    // ─── Core counts (parallel batch 1) ─────────────────────
    const [
      totalUsers,
      totalBusinesses,
      totalProducts,
      totalServices,
      totalWorkers,
      totalStores,
      totalOrders,
      totalSales,
    ] = await Promise.all([
      client.client.count(),
      client.business.count(),
      client.product.count(),
      client.freelanceService.count(),
      client.worker.count(),
      client.store.count(),
      client.order.count(),
      client.sale.count({
        where: { status: 'COMPLETED' },
      }),
    ])

    // ─── Financial aggregates (parallel batch 2) ────────────
    const [
      transactionCount,
      revenueRes,
      salesRevenueRes,
      tokenVolumeRes,
      rechargeVolumeRes,
    ] = await Promise.all([
      client.paymentTransaction.count({
        where: { status: 'COMPLETED' },
      }),
      client.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      client.sale.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' },
      }),
      client.tokenTransaction.aggregate({
        _sum: { amount: true },
      }),
      client.accountRecharge.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
    ])

    const totalTransactions = transactionCount
    const totalRevenue =
      revenueRes._sum.amount || 0
    const totalSalesRevenue =
      salesRevenueRes._sum.totalAmount || 0
    const totalTokenVolume =
      tokenVolumeRes._sum.amount || 0
    const totalRechargeVolume =
      rechargeVolumeRes._sum.amount || 0
    const averageTransactionValue =
      totalTransactions > 0
        ? totalRevenue / totalTransactions
        : 0

    // ─── Active today counts (parallel batch 3) ─────────────
    const since24h = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    )
    const [
      activeUsersToday,
      activeBusinessesToday,
      activeWorkersToday,
    ] = await Promise.all([
      client.client.count({
        where: {
          OR: [
            { lastLogin: { gte: since24h } },
            { createdAt: { gte: since24h } },
          ],
        },
      }),
      client.business.count({
        where: {
          OR: [
            { lastLogin: { gte: since24h } },
            { createdAt: { gte: since24h } },
          ],
        },
      }),
      client.worker.count({
        where: {
          OR: [
            { lastLogin: { gte: since24h } },
            { createdAt: { gte: since24h } },
          ],
        },
      }),
    ])

    // ─── KYC + Disputes + Ads (parallel batch 4) ────────────
    const [
      kycPendingCount,
      kycVerifiedCount,
      kycRejectedCount,
      disputesOpenCount,
      disputesResolvedCount,
      adsActiveCount,
      adsPendingCount,
    ] = await Promise.all([
      client.business.count({
        where: { kycStatus: 'PENDING' },
      }),
      client.business.count({
        where: { kycStatus: 'VERIFIED' },
      }),
      client.business.count({
        where: { kycStatus: 'REJECTED' },
      }),
      client.dispute.count({
        where: { status: 'OPEN' },
      }),
      client.dispute.count({
        where: { status: 'RESOLVED' },
      }),
      client.ad.count({
        where: { endedAt: null },
      }),
      client.ad.count({
        where: { endedAt: { not: null } },
      }),
    ])

    // ─── Business type distribution ─────────────────────────
    const businessTypeGroups =
      await client.business.groupBy({
        by: ['businessType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      })
    const businessTypeDistribution =
      businessTypeGroups.map((g: any) => ({
        type: g.businessType || 'Unknown',
        count: g._count.id,
      }))

    // ─── Time-series: transaction counts (last 30 days) ─────
    const last30Days: {
      date: string
      count: number
    }[] = []
    for (let i = 29; i >= 0; i--) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - i)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      const cnt =
        await client.paymentTransaction.count({
          where: {
            createdAt: { gte: start, lt: end },
            status: 'COMPLETED',
          },
        })
      last30Days.push({
        date: start.toISOString().split('T')[0],
        count: cnt,
      })
    }
    const last7Days = last30Days.slice(23, 30)

    // last24Hours hourly counts
    const last24Hours: {
      date: string
      count: number
    }[] = []
    for (let i = 23; i >= 0; i--) {
      const start = new Date(
        Date.now() - i * 60 * 60 * 1000,
      )
      start.setMinutes(0, 0, 0)
      const end = new Date(
        start.getTime() + 60 * 60 * 1000,
      )
      const cnt =
        await client.paymentTransaction.count({
          where: {
            createdAt: { gte: start, lt: end },
            status: 'COMPLETED',
          },
        })
      last24Hours.push({
        date: start.toISOString(),
        count: cnt,
      })
    }

    // ─── Growth metrics: signup trends (last 30 days) ───────
    const userSignups30d: {
      date: string
      count: number
    }[] = []
    const businessSignups30d: {
      date: string
      count: number
    }[] = []
    for (let i = 29; i >= 0; i--) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - i)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      const dateStr = start
        .toISOString()
        .split('T')[0]

      const [userCount, bizCount] =
        await Promise.all([
          client.client.count({
            where: {
              createdAt: { gte: start, lt: end },
            },
          }),
          client.business.count({
            where: {
              createdAt: { gte: start, lt: end },
            },
          }),
        ])
      userSignups30d.push({
        date: dateStr,
        count: userCount,
      })
      businessSignups30d.push({
        date: dateStr,
        count: bizCount,
      })
    }

    // ─── GMV (Gross Merchandise Volume) — last 30 days ──────
    const gmv30d: {
      date: string
      amount: number
    }[] = []
    for (let i = 29; i >= 0; i--) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - i)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      const dateStr = start
        .toISOString()
        .split('T')[0]

      const dayRevenue =
        await client.sale.aggregate({
          _sum: { totalAmount: true },
          where: {
            createdAt: { gte: start, lt: end },
            status: 'COMPLETED',
          },
        })
      gmv30d.push({
        date: dateStr,
        amount: dayRevenue._sum.totalAmount || 0,
      })
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
      // Phase 15 additions
      totalWorkers,
      totalStores,
      totalOrders,
      totalTokenVolume,
      totalRechargeVolume,
      totalSales,
      totalSalesRevenue,
      activeWorkersToday,
      userSignups30d,
      businessSignups30d,
      gmv30d,
      businessTypeDistribution,
    }
  }

  async getKycSubmissions(
    search?: string,
    status?: string,
    businessType?: string,
    page = 1,
    limit = 10,
  ) {
    const client = this.prisma
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    if (search || businessType) {
      where.business = {
        AND: [],
      }
      if (search) {
        where.business.AND.push({
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        })
      }
      if (businessType) {
        where.business.AND.push({
          businessType: {
            contains: businessType,
            mode: 'insensitive',
          },
        })
      }
    }

    const [items, total] = await Promise.all([
      client.kYC.findMany({
        where,
        skip,
        take: limit,
        include: {
          business: {
            include: {
              kycDocuments: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      client.kYC.count({ where }),
    ])

    return {
      items: items.map((item: any) => ({
        ...item,
        notes: item.business?.kyc?.notes || null,
      })),
      total,
      page,
      limit,
    }
  }

  async getTokenReconciliation() {
    const client = this.prisma as any

    // ─── Token Transaction Side ─────────────────────────────
    const allTokenTx =
      await client.tokenTransaction.findMany({
        select: {
          amount: true,
          isRedeemed: true,
          isReleased: true,
        },
      })

    const totalTokensIssued = sumPrecise(
      allTokenTx.map((t: any) => t.amount),
    )
    const totalTokensRedeemed = sumPrecise(
      allTokenTx
        .filter((t: any) => t.isRedeemed)
        .map((t: any) => t.amount),
    )
    const totalTokensReleased = sumPrecise(
      allTokenTx
        .filter((t: any) => t.isReleased)
        .map((t: any) => t.amount),
    )
    const totalTokensPending = sumPrecise(
      allTokenTx
        .filter(
          (t: any) =>
            (t.isRedeemed && !t.isReleased) ||
            (!t.isRedeemed && t.isReleased),
        )
        .map((t: any) => t.amount),
    )
    const totalTokensReserved = sumPrecise(
      allTokenTx
        .filter(
          (t: any) =>
            !t.isRedeemed && !t.isReleased,
        )
        .map((t: any) => t.amount),
    )

    // ─── Wallet (Recharge) Side — TOKEN method only ─────────
    const tokenRecharges =
      await client.accountRecharge.findMany({
        where: {
          method: 'TOKEN',
          status: 'COMPLETED',
        },
        select: {
          amount: true,
          businessId: true,
          clientId: true,
        },
      })

    const totalWalletTokenBalance = sumPrecise(
      tokenRecharges.map((r: any) => r.amount),
    )
    const totalBusinessTokenBalance = sumPrecise(
      tokenRecharges
        .filter((r: any) => r.businessId)
        .map((r: any) => r.amount),
    )
    const totalClientTokenBalance = sumPrecise(
      tokenRecharges
        .filter((r: any) => r.clientId)
        .map((r: any) => r.amount),
    )

    // ─── Ledger Side ────────────────────────────────────────
    const allLedger =
      await client.ledgerEntry.findMany({
        select: { type: true, amount: true },
      })
    const totalLedgerCredits = sumPrecise(
      allLedger
        .filter((l: any) => l.type === 'CREDIT')
        .map((l: any) => l.amount),
    )
    const totalLedgerDebits = sumPrecise(
      allLedger
        .filter((l: any) => l.type === 'DEBIT')
        .map((l: any) => l.amount),
    )
    const ledgerNetBalance = sumPrecise([
      totalLedgerCredits,
      -totalLedgerDebits,
    ])

    // ─── Discrepancy Check ──────────────────────────────────
    // Token supply (issued) should equal the sum of all wallet token balances
    // A discrepancy indicates double-counting, missing entries, or precision errors
    const discrepancy = sumPrecise([
      totalTokensIssued,
      -totalWalletTokenBalance,
    ])
    const isBalanced =
      Math.abs(discrepancy) < 0.01 // Tolerance for float remnants

    // ─── Top Token Holders ──────────────────────────────────
    // Business holders
    const businessHolders =
      await client.business.findMany({
        select: { id: true, name: true },
        take: 100,
      })

    const holderBalances: any[] = []
    for (const biz of businessHolders) {
      const bizTokenTx =
        await client.tokenTransaction.findMany({
          where: { businessId: biz.id },
          select: { amount: true },
        })
      const bizRecharges =
        await client.accountRecharge.findMany({
          where: {
            businessId: biz.id,
            method: 'TOKEN',
            status: 'COMPLETED',
          },
          select: { amount: true },
        })
      const tokenBalance = sumPrecise(
        bizTokenTx.map((t: any) => t.amount),
      )
      const rechargeBalance = sumPrecise(
        bizRecharges.map((r: any) => r.amount),
      )
      if (
        tokenBalance !== 0 ||
        rechargeBalance !== 0
      ) {
        holderBalances.push({
          id: biz.id,
          name: biz.name,
          type: 'business',
          tokenBalance,
          rechargeBalance,
          transactionCount:
            bizTokenTx.length +
            bizRecharges.length,
        })
      }
    }

    // Sort by absolute token balance, top 10
    holderBalances.sort(
      (a, b) =>
        Math.abs(b.tokenBalance) -
        Math.abs(a.tokenBalance),
    )
    const topHolders = holderBalances.slice(0, 10)

    // ─── Counts ─────────────────────────────────────────────
    const [
      totalTokenTransactions,
      totalRechargeTransactions,
      totalLedgerEntries,
    ] = await Promise.all([
      client.tokenTransaction.count(),
      client.accountRecharge.count({
        where: { method: 'TOKEN' },
      }),
      client.ledgerEntry.count(),
    ])

    return {
      totalTokensIssued,
      totalTokensRedeemed,
      totalTokensReleased,
      totalTokensPending,
      totalTokensReserved,
      totalWalletTokenBalance,
      totalBusinessTokenBalance,
      totalClientTokenBalance,
      totalLedgerCredits,
      totalLedgerDebits,
      ledgerNetBalance,
      discrepancy,
      isBalanced,
      reconciliationDate: new Date(),
      topHolders,
      totalTokenTransactions,
      totalRechargeTransactions,
      totalLedgerEntries,
    }
  }
}
