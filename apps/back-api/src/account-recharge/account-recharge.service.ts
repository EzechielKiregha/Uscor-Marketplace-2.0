import { Injectable } from '@nestjs/common'
import { CreateAccountRechargeInput } from './dto/create-account-recharge.input'
import { UpdateAccountRechargeInput } from './dto/update-account-recharge.input'
import { PrismaService } from '../prisma/prisma.service'

// Service
@Injectable()
export class AccountRechargeService {
  constructor(private prisma: PrismaService) {}

  async create(
    createAccountRechargeInput: CreateAccountRechargeInput,
    userId: string,
    userRole: string,
  ) {
    const {
      clientId,
      businessId,
      tokenTransactionId,
      ...data
    } = createAccountRechargeInput

    // Validate that only one of clientId or businessId is provided
    if (clientId && businessId) {
      throw new Error(
        'Only one of clientId or businessId should be provided',
      )
    }
    if (!clientId && !businessId) {
      throw new Error(
        'Either clientId or businessId must be provided',
      )
    }

    // Ensure user is recharging their own account
    if (
      userRole === 'client' &&
      clientId !== userId
    ) {
      throw new Error(
        'Clients can only recharge their own account',
      )
    }
    if (
      userRole === 'business' &&
      businessId !== userId
    ) {
      throw new Error(
        'Businesses can only recharge their own account',
      )
    }

    // Validate tokenTransactionId if provided
    if (tokenTransactionId) {
      const tokenTransaction =
        await this.prisma.tokenTransaction.findUnique(
          {
            where: { id: tokenTransactionId },
          },
        )
      if (!tokenTransaction) {
        throw new Error(
          'TokenTransaction not found',
        )
      }
      if (
        tokenTransaction.isRedeemed !== true ||
        tokenTransaction.isReleased !== true
      ) {
        throw new Error(
          'TokenTransaction must be both redeemed and released',
        )
      }
    }

    return this.prisma.accountRecharge.create({
      data: {
        ...data,
        client: clientId
          ? { connect: { id: clientId } }
          : undefined,
        business: businessId
          ? { connect: { id: businessId } }
          : undefined,
        tokenTransaction: tokenTransactionId
          ? {
              connect: { id: tokenTransactionId },
            }
          : undefined,
      },
      include: {
        client: clientId
          ? {
              select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
              },
            }
          : false,
        business: businessId
          ? {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
              },
            }
          : false,
        tokenTransaction: tokenTransactionId
          ? {
              select: {
                id: true,
                businessId: true,
                amount: true,
                type: true,
                createdAt: true,
              },
            }
          : false,
      },
    })
  }

  async getBalance(
    userId: string,
    userRole: string,
  ): Promise<number> {
    const recharges =
      await this.prisma.accountRecharge.findMany({
        where: {
          OR: [
            {
              businessId:
                userRole === 'business'
                  ? userId
                  : undefined,
            },
            {
              clientId:
                userRole === 'client'
                  ? userId
                  : undefined,
            },
          ],
        },
        select: { amount: true },
      })
    return recharges.reduce(
      (sum, recharge) => sum + recharge.amount,
      0,
    )
  }

  async findAll() {
    return this.prisma.accountRecharge.findMany({
      include: {
        client: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        tokenTransaction: {
          select: {
            id: true,
            businessId: true,
            amount: true,
            type: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.accountRecharge.findUnique(
      {
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
            },
          },
          business: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
          tokenTransaction: {
            select: {
              id: true,
              businessId: true,
              amount: true,
              type: true,
              createdAt: true,
            },
          },
        },
      },
    )
  }

  async update(
    id: string,
    updateAccountRechargeInput: UpdateAccountRechargeInput,
    userId: string,
    userRole: string,
  ) {
    const recharge = await this.findOne(id)
    if (!recharge) {
      throw new Error(
        'Account recharge not found',
      )
    }
    if (
      userRole === 'client' &&
      recharge.clientId !== userId
    ) {
      throw new Error(
        'Clients can only update their own recharges',
      )
    }
    if (
      userRole === 'business' &&
      recharge.businessId !== userId
    ) {
      throw new Error(
        'Businesses can only update their own recharges',
      )
    }

    const { amount, method, origin } =
      updateAccountRechargeInput
    return this.prisma.accountRecharge.update({
      where: { id },
      data: { amount, method, origin },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tokenTransaction: {
          select: {
            id: true,
            businessId: true,
            amount: true,
            type: true,
          },
        },
      },
    })
  }

  async remove(
    id: string,
    userId: string,
    userRole: string,
  ) {
    const recharge = await this.findOne(id)
    if (!recharge) {
      throw new Error(
        'Account recharge not found',
      )
    }
    if (
      userRole === 'client' &&
      recharge.clientId !== userId
    ) {
      throw new Error(
        'Clients can only delete their own recharges',
      )
    }
    if (
      userRole === 'business' &&
      recharge.businessId !== userId
    ) {
      throw new Error(
        'Businesses can only delete their own recharges',
      )
    }

    return this.prisma.accountRecharge.delete({
      where: { id },
      select: { id: true, amount: true },
    })
  }
}
