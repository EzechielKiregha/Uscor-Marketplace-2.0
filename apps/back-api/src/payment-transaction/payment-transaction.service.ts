import { Injectable } from '@nestjs/common'
import { CreatePaymentTransactionInput } from './dto/create-payment-transaction.input'
import { UpdatePaymentTransactionInput } from './dto/update-payment-transaction.input'
import { PrismaService } from '../prisma/prisma.service'
import {
  PaymentMethod,
  PaymentStatus,
} from '../generated/prisma/enums'
import { AccountRechargeService } from '../account-recharge/account-recharge.service'
import {
  Country,
  RechargeMethod,
} from '../account-recharge/dto/create-account-recharge.input'

// Service
@Injectable()
export class PaymentTransactionService {
  constructor(
    private prisma: PrismaService,
    private accountRechargeService: AccountRechargeService,
  ) {}

  async validateTokenBalance(
    clientId: string,
    amount: number,
    method : RechargeMethod,
  ): Promise<boolean> {

    let mtd

    switch (method) {
      case RechargeMethod.MTN_MONEY:
        mtd = RechargeMethod.MTN_MONEY
        break
      case RechargeMethod.AIRTEL_MONEY:
        mtd = RechargeMethod.AIRTEL_MONEY
        break
      case RechargeMethod.MPESA:
        mtd = RechargeMethod.MPESA
        break
      case RechargeMethod.ORANGE_MONEY:
        mtd = RechargeMethod.ORANGE_MONEY
        break
      case RechargeMethod.TOKEN:
        mtd = RechargeMethod.TOKEN
        break
      default:
        throw new Error('Invalid recharge method')
    }

    const balance =
      await this.accountRechargeService.getBalance(
        clientId,
        'client',
        mtd,
      )
    return balance >= amount
  }

  async create(
    createPaymentTransactionInput: CreatePaymentTransactionInput,
    clientId: string,
  ) {
    const { orderId, method, amount, ...data } =
      createPaymentTransactionInput

    // Check if PaymentTransaction already exists for the order
    const existingTransaction =
      await this.prisma.paymentTransaction.findUnique(
        {
          where: { orderId },
        },
      )
    if (existingTransaction) {
      throw new Error(
        'Payment transaction already initialized for this order. Use update instead.',
      )
    }

    // Validate token balance for TOKEN method
    if (method === PaymentMethod.TOKEN) {
      const hasEnoughTokens =
        await this.validateTokenBalance(
          clientId,
          amount || 0,
          RechargeMethod.TOKEN,
        )
      if (!hasEnoughTokens) {
        throw new Error(
          'Insufficient token balance',
        )
      }
    }

    return this.prisma.paymentTransaction.create({
      data: {
        ...data,
        amount: amount || 0,
        method,
        order: { connect: { id: orderId } },
      },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionDate: true,
        qrCode: true,
        createdAt: true,
        order: {
          select: {
            id: true,
            deliveryFee: true,
            deliveryAddress: true,
            createdAt: true,
          },
        },
        postTransactions: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async update(
    id: string,
    updatePaymentTransactionInput: UpdatePaymentTransactionInput,
    clientId: string,
  ) {
    const { status, qrCode } =
      updatePaymentTransactionInput
    const transaction = await this.findOne(id)
    if (!transaction) {
      throw new Error(
        'Payment transaction not found',
      )
    }

    // If status is changing to COMPLETED, validate and deduct balance
    if (
      status === "COMPLETED" &&
      transaction.status !==
        PaymentStatus.COMPLETED
    ) {
      if (
        transaction.method === PaymentMethod.TOKEN
      ) {

        const hasEnoughTokens =
          await this.validateTokenBalance(
            clientId,
            transaction.amount,
            RechargeMethod.TOKEN,
          )
        if (!hasEnoughTokens) {
          throw new Error(
            'Insufficient token balance',
          )
        }
        // Deduct balance by creating a negative AccountRecharge
        await this.accountRechargeService.create(
          {
            amount: -transaction.amount,
            method: RechargeMethod.TOKEN, // Placeholder; adjust as needed
            origin: Country.DRC, // Placeholder; adjust as needed
            clientId,
            businessId: undefined,
          },
          clientId,
          'client',
        )
      } else if (transaction.method === PaymentMethod.MOBILE_MONEY ) {
        let mtd = RechargeMethod.AIRTEL_MONEY
        // Validate token balance

        let hasEnoughBalance = await this.validateTokenBalance(
          clientId,
          transaction.amount,
          mtd,
        )

        if (!hasEnoughBalance) {
          mtd = RechargeMethod.MTN_MONEY
          hasEnoughBalance = await this.validateTokenBalance(
            clientId,
            transaction.amount,
            mtd,
          )
          if(!hasEnoughBalance){
            mtd = RechargeMethod.ORANGE_MONEY
            hasEnoughBalance = await this.validateTokenBalance(
              clientId,
              transaction.amount,
              mtd,
            )
            if(!hasEnoughBalance){
              mtd = RechargeMethod.MPESA
              hasEnoughBalance = await this.validateTokenBalance(
                clientId,
                transaction.amount,
                mtd,
              )
            }
          }
        }
        // Deduct balance by creating a negative AccountRecharge
        await this.accountRechargeService.create(
          {
            amount: -transaction.amount,
            method: mtd, // Placeholder; adjust as needed
            origin: Country.DRC, // Placeholder; adjust as needed
            clientId,
            businessId: undefined,
          },
          clientId,
          'client',
        )
      } else if (transaction.method === PaymentMethod.CARD ) {
        // For CARD payments, assume external processing is done
        console.log('Card payment processed externally')

      } else if (transaction.method === PaymentMethod.CASH ) {
        // For CASH payments, no balance deduction needed
        console.log('Cash payment - no balance deduction')
      } else {
        throw new Error(
          'Unsupported payment method',
        )
      }
    }

    return this.prisma.paymentTransaction.update({
      where: { id },
      data: { status: PaymentStatus.COMPLETED, qrCode },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionDate: true,
        qrCode: true,
        createdAt: true,
        order: {
          select: { id: true, deliveryFee: true },
        },
      },
    })
  }

  async findAll() {
    return this.prisma.paymentTransaction.findMany(
      {
        include: {
          order: {
            select: {
              id: true,
              deliveryFee: true,
              deliveryAddress: true,
              createdAt: true,
            },
          },
          postTransactions: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    )
  }

  async findOne(id: string) {
    return this.prisma.paymentTransaction.findUnique(
      {
        where: { id },
        include: {
          order: {
            select: {
              id: true,
              deliveryFee: true,
              deliveryAddress: true,
              createdAt: true,
            },
          },
          postTransactions: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    )
  }

  async remove(id: string) {
    return this.prisma.paymentTransaction.delete({
      where: { id },
      select: { id: true, amount: true },
    })
  }
}
