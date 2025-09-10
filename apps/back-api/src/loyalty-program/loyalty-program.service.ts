import { Injectable } from '@nestjs/common'
import {
  CreateLoyaltyProgramInput,
  CreatePointsTransactionInput,
  EarnPointsInput,
  RedeemPointsInput,
} from './dto/loyalty-program.input'
import { PrismaService } from '../prisma/prisma.service'
import { BusinessService } from '../business/business.service'
import { ClientService } from '../client/client.service'
import { UpdateLoyaltyProgramInput } from './dto/update-loyalty-program.input'

// Service
@Injectable()
export class LoyaltyService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
    private clientService: ClientService,
  ) {}

  async createLoyaltyProgram(
    input: CreateLoyaltyProgramInput,
    user: { id: string; role: string },
  ) {
    const {
      businessId,
      name,
      description,
      pointsPerPurchase,
      minimumPointsToRedeem,
    } = input

    if (user.role !== 'business') {
      throw new Error(
        'Only business owners can create loyalty programs',
      )
    }
    await this.businessService.verifyBusinessAccess(
      businessId,
      user,
    )

    return this.prisma.loyaltyProgram.create({
      data: {
        business: { connect: { id: businessId } },
        name,
        description,
        pointsPerPurchase,
        minimumPointsToRedeem,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        pointsTransactions: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async updateLoyaltyProgram(
    id: string,
    input: UpdateLoyaltyProgramInput,
    user: { id: string; role: string },
  ) {
    const loyaltyProgram =
      await this.prisma.loyaltyProgram.findUnique(
        {
          where: { id },
          include: { business: true },
        },
      )
    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found')
    }
    if (user.role !== 'business') {
      throw new Error(
        'Only business owners can update loyalty programs',
      )
    }
    await this.businessService.verifyBusinessAccess(
      loyaltyProgram.businessId,
      user,
    )

    return this.prisma.loyaltyProgram.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        pointsPerPurchase:
          input.pointsPerPurchase,
        minimumPointsToRedeem:
          input.minimumPointsToRedeem,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        pointsTransactions: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async createPointsTransaction(
    input: CreatePointsTransactionInput,
    user: { id: string; role: string },
  ) {
    const { clientId, loyaltyProgramId, points } =
      input

    const loyaltyProgram =
      await this.prisma.loyaltyProgram.findUnique(
        {
          where: { id: loyaltyProgramId },
          include: { business: true },
        },
      )
    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found')
    }
    await this.businessService.verifyBusinessAccess(
      loyaltyProgram.businessId,
      user,
    )

    const client =
      await this.clientService.findOne(clientId)
    if (!client) {
      throw new Error('Client not found')
    }

    return this.prisma.pointsTransaction.create({
      data: {
        client: { connect: { id: clientId } },
        loyaltyProgram: {
          connect: { id: loyaltyProgramId },
        },
        points,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            createdAt: true,
          },
        },
        loyaltyProgram: {
          select: {
            id: true,
            name: true,
            pointsPerPurchase: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async getPointsTransactionsByClient(
    clientId: string,
    user: { id: string; role: string },
  ) {
    const client =
      await this.clientService.findOne(clientId)
    if (!client) {
      throw new Error('Client not found')
    }
    await this.businessService.verifyBusinessAccess(
      null,
      user,
    )

    return this.prisma.pointsTransaction.findMany(
      {
        where: { clientId },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              createdAt: true,
            },
          },
          loyaltyProgram: {
            select: {
              id: true,
              name: true,
              pointsPerPurchase: true,
              createdAt: true,
            },
          },
        },
      },
    )
  }

  async getPointsTransactionsByProgram(
    loyaltyProgramId: string,
    user: { id: string; role: string },
  ) {
    const loyaltyProgram =
      await this.prisma.loyaltyProgram.findUnique(
        {
          where: { id: loyaltyProgramId },
          include: { business: true },
        },
      )
    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found')
    }
    await this.businessService.verifyBusinessAccess(
      loyaltyProgram.businessId,
      user,
    )

    return this.prisma.pointsTransaction.findMany(
      {
        where: { loyaltyProgramId },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              createdAt: true,
            },
          },
          loyaltyProgram: {
            select: {
              id: true,
              name: true,
              pointsPerPurchase: true,
              createdAt: true,
            },
          },
        },
      },
    )
  }

  async getClientPointsBalance(
    clientId: string,
    user: { id: string; role: string },
  ) {
    const client =
      await this.clientService.findOne(clientId)
    if (!client) {
      throw new Error('Client not found')
    }
    await this.businessService.verifyBusinessAccess(
      null,
      user,
    )

    const balance =
      await this.prisma.pointsTransaction.aggregate(
        {
          where: { clientId },
          _sum: { points: true },
        },
      )

    return {
      clientId,
      client: {
        id: client.id,
        name: client.fullName,
        createdAt: client.createdAt,
      },
      totalPoints: balance._sum.points || 0,
    }
  }

  // New methods to match frontend expectations
  async getLoyaltyPrograms(
    businessId: string,
    user: { id: string; role: string },
  ) {
    if (user.role !== 'business') {
      throw new Error(
        'Only business owners can view loyalty programs',
      )
    }
    await this.businessService.verifyBusinessAccess(
      businessId,
      user,
    )

    return this.prisma.loyaltyProgram.findMany({
      where: { businessId },
      include: {
        business: {
          select: { id: true, name: true },
        },
        pointsTransactions: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async getLoyaltyProgramById(
    id: string,
    user: { id: string; role: string },
  ) {
    const program =
      await this.prisma.loyaltyProgram.findUnique(
        {
          where: { id },
          include: {
            business: {
              select: { id: true, name: true },
            },
            pointsTransactions: {
              include: {
                client: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      )

    if (!program) {
      throw new Error('Loyalty program not found')
    }

    await this.businessService.verifyBusinessAccess(
      program.businessId,
      user,
    )
    return program
  }

  async getCustomerPoints(
    businessId: string,
    clientId: string,
    user: { id: string; role: string },
  ) {
    await this.businessService.verifyBusinessAccess(
      businessId,
      user,
    )

    const client =
      await this.clientService.findOne(clientId)
    if (!client) {
      throw new Error('Client not found')
    }

    const program =
      await this.prisma.loyaltyProgram.findFirst({
        where: { businessId },
      })

    if (!program) {
      throw new Error(
        'No loyalty program found for this business',
      )
    }

    const transactions =
      await this.prisma.pointsTransaction.findMany(
        {
          where: {
            clientId,
            loyaltyProgramId: program.id,
          },
          orderBy: { createdAt: 'desc' },
        },
      )

    const totalPoints = transactions.reduce(
      (sum, transaction) =>
        sum + transaction.points,
      0,
    )

    return {
      totalPoints,
      program: {
        id: program.id,
        name: program.name,
        pointsPerPurchase:
          program.pointsPerPurchase,
        minimumPointsToRedeem:
          program.minimumPointsToRedeem,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        points: t.points,
        createdAt: t.createdAt,
        type:
          t.points > 0 ? 'EARNED' : 'REDEEMED',
      })),
    }
  }

  async getLoyaltyAnalytics(
    businessId: string,
    period: string = 'month',
    user: { id: string; role: string },
  ) {
    await this.businessService.verifyBusinessAccess(
      businessId,
      user,
    )

    const program =
      await this.prisma.loyaltyProgram.findFirst({
        where: { businessId },
      })

    if (!program) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        pointsEarned: 0,
        pointsRedeemed: 0,
        redemptionRate: 0,
        topCustomers: [],
        pointsByDay: [],
      }
    }

    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    const transactions =
      await this.prisma.pointsTransaction.findMany(
        {
          where: {
            loyaltyProgramId: program.id,
            createdAt: { gte: startDate },
          },
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      )

    const totalMembers =
      await this.prisma.pointsTransaction.groupBy(
        {
          by: ['clientId'],
          where: { loyaltyProgramId: program.id },
        },
      )

    const pointsEarned = transactions
      .filter((t) => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0)
    const pointsRedeemed = Math.abs(
      transactions
        .filter((t) => t.points < 0)
        .reduce((sum, t) => sum + t.points, 0),
    )

    return {
      totalMembers: totalMembers.length,
      activeMembers:
        transactions.length > 0
          ? new Set(
              transactions.map((t) => t.clientId),
            ).size
          : 0,
      pointsEarned,
      pointsRedeemed,
      redemptionRate:
        pointsEarned > 0
          ? (pointsRedeemed / pointsEarned) * 100
          : 0,
      topCustomers: [], // TODO: Implement top customers calculation
      pointsByDay: [], // TODO: Implement points by day calculation
    }
  }

  async earnPoints(
    input: EarnPointsInput,
    user: { id: string; role: string },
  ) {
    const {
      clientId,
      loyaltyProgramId,
      points,
      orderId,
    } = input

    const loyaltyProgram =
      await this.prisma.loyaltyProgram.findUnique(
        {
          where: { id: loyaltyProgramId },
          include: { business: true },
        },
      )

    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found')
    }

    await this.businessService.verifyBusinessAccess(
      loyaltyProgram.businessId,
      user,
    )

    const client =
      await this.clientService.findOne(clientId)
    if (!client) {
      throw new Error('Client not found')
    }

    return this.prisma.pointsTransaction.create({
      data: {
        client: { connect: { id: clientId } },
        loyaltyProgram: {
          connect: { id: loyaltyProgramId },
        },
        points: Math.abs(points), // Ensure positive for earning
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        loyaltyProgram: {
          select: {
            id: true,
            name: true,
            business: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })
  }

  async redeemPoints(
    input: RedeemPointsInput,
    user: { id: string; role: string },
  ) {
    const {
      clientId,
      loyaltyProgramId,
      points,
      rewardDescription,
    } = input

    const loyaltyProgram =
      await this.prisma.loyaltyProgram.findUnique(
        {
          where: { id: loyaltyProgramId },
          include: { business: true },
        },
      )

    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found')
    }

    await this.businessService.verifyBusinessAccess(
      loyaltyProgram.businessId,
      user,
    )

    const client =
      await this.clientService.findOne(clientId)
    if (!client) {
      throw new Error('Client not found')
    }

    // Check if client has enough points
    const balance =
      await this.prisma.pointsTransaction.aggregate(
        {
          where: {
            clientId,
            loyaltyProgramId,
          },
          _sum: { points: true },
        },
      )

    const currentPoints = balance._sum.points || 0
    if (currentPoints < points) {
      throw new Error(
        'Insufficient points for redemption',
      )
    }

    return this.prisma.pointsTransaction.create({
      data: {
        client: { connect: { id: clientId } },
        loyaltyProgram: {
          connect: { id: loyaltyProgramId },
        },
        points: -Math.abs(points), // Negative for redemption
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        loyaltyProgram: {
          select: {
            id: true,
            name: true,
            business: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })
  }
}
