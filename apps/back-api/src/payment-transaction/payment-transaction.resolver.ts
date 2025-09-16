import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
} from '@nestjs/graphql'
import { PaymentTransactionService } from './payment-transaction.service'
import { PaymentTransactionEntity } from './entities/payment-transaction.entity'
import { CreatePaymentTransactionInput } from './dto/create-payment-transaction.input'
import { UpdatePaymentTransactionInput } from './dto/update-payment-transaction.input'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UseGuards } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

// Resolver
@Resolver(() => PaymentTransactionEntity)
export class PaymentTransactionResolver {
  constructor(
    private readonly paymentTransactionService: PaymentTransactionService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Mutation(() => PaymentTransactionEntity, {
    description:
      'Creates a new payment transaction.',
  })
  async createPaymentTransaction(
    @Args('createPaymentTransactionInput')
    createPaymentTransactionInput: CreatePaymentTransactionInput,
    @Context() context,
  ) {
    const user = context.req.user
    const order =
      await this.prisma.order.findUnique({
        where: {
          id: createPaymentTransactionInput.orderId,
        },
        select: { clientId: true },
      })
    if (!order || user.id !== order.clientId) {
      throw new Error(
        'Clients can only create payments for their own orders',
      )
    }
    return this.paymentTransactionService.create(
      createPaymentTransactionInput,
      user.id,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => [PaymentTransactionEntity], {
    name: 'paymentTransactions',
    description:
      'Retrieves payment transactions based on user role.',
  })
  async getPaymentTransactions(
    @Context() context,
  ) {
    const user = context.req.user
    const items = await (async () => {
      if (user.role === 'client') {
        return this.prisma.paymentTransaction.findMany({
          where: {
            order: { clientId: user.id },
          },
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
              orderBy: { createdAt: 'desc' },
              take: 1,
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
      if (user.role === 'business') {
        return this.prisma.paymentTransaction.findMany({
          where: {
            order: {
              products: {
                some: {
                  product: { businessId: user.id },
                },
              },
            },
          },
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
              orderBy: { createdAt: 'desc' },
              take: 1,
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
      throw new Error('Unauthorized role')
    })()

    // Map latest postTransactions[0] to postTransaction
    return items.map((t: any) => ({
      ...t,
      postTransaction: t.postTransactions?.[0] ?? null,
    }))
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => PaymentTransactionEntity, {
    name: 'paymentTransaction',
    description:
      'Retrieves a single payment transaction by ID.',
  })
  async getPaymentTransaction(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    const transaction =
      await this.paymentTransactionService.findOne(
        id,
      )
    if (!transaction?.orderId) {
      throw new Error(
        'Payment transaction not found',
      )
    }
    if (user.role === 'client') {
      const order =
        await this.prisma.order.findUnique({
          where: { id: transaction.orderId },
          select: { clientId: true },
        })

      if (!order)
        return new Error('Order no found')

      if (order.clientId !== user.id) {
        throw new Error(
          'Clients can only access their own payment transactions',
        )
      }
    }
    if (user.role === 'business') {
      const order =
        await this.prisma.order.findUnique({
          where: { id: transaction.orderId },
          include: {
            products: {
              select: {
                product: {
                  select: { businessId: true },
                },
              },
            },
          },
        })
      if (!order)
        return new Error('Order no found')

      if (
        !order.products.some(
          (item) =>
            item.product.businessId === user.id,
        )
      ) {
        throw new Error(
          'Businesses can only access transactions for their products',
        )
      }
    }
    return transaction
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Mutation(() => PaymentTransactionEntity, {
    description:
      'Updates a payment transaction’s status or QR code.',
  })
  async updatePaymentTransaction(
    @Context() context,
    @Args('id', { type: () => String })
    id: string,
    @Args('input')
    input: UpdatePaymentTransactionInput,
  ) {
    const user = context.req.user
    const transaction = await this.paymentTransactionService.findOne(id)
    if (!transaction?.orderId) {
      throw new Error(
        'Payment transaction not found',
      )
    }
    const order =
      await this.prisma.order.findUnique({
        where: { id: transaction.orderId },
        select: { clientId: true, payment: true, products: { select: { product: { select: { businessId: true } } } } },
      })
    if (!order) return new Error('Order no found')

    if ( !order.products.some((item) => item.product.businessId === user.id) && order.clientId !== user.id) {
      throw new Error(
        'Businesses can only update their clients payment transactions',
      )
    }
    if (!order.payment)
      return new Error(
        "This order's payment was not initialized",
      )

    return this.paymentTransactionService.update(
      id,
      input,
      order.clientId,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Mutation(() => PaymentTransactionEntity, {
    description: 'Deletes a payment transaction.',
  })
  async deletePaymentTransaction(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    const transaction =
      await this.paymentTransactionService.findOne(
        id,
      )
    if (!transaction?.orderId) {
      throw new Error(
        'Payment transaction not found',
      )
    }
    const order =
      await this.prisma.order.findUnique({
        where: { id: transaction.orderId },
        select: { clientId: true },
      })
    if (!order) return new Error('Order no found')

    if (order.clientId !== user.id) {
      throw new Error(
        'Clients can only delete their own payment transactions',
      )
    }
    return this.paymentTransactionService.remove(
      id,
    )
  }
}
