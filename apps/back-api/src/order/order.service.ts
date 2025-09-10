import { Injectable } from '@nestjs/common'
import { CreateOrderInput } from './dto/create-order.input'
import { UpdateOrderInput } from './dto/update-order.input'
import { PrismaService } from '../prisma/prisma.service'
import { PaymentStatus } from '../generated/prisma/enums'
import { TokenTransactionService } from '../token-transaction/token-transaction.service'
import { TokenTransactionType } from '../token-transaction/dto/create-token-transaction.input'
// Service
@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private tokenTransactionService: TokenTransactionService,
  ) {}

  async create(
    createOrderInput: CreateOrderInput,
  ) {
    const {
      clientId,
      orderProducts,
      payment,
      ...orderData
    } = createOrderInput

    // Validate client
    const client =
      await this.prisma.client.findUnique({
        where: { id: clientId },
      })
    if (!client) {
      throw new Error('Client not found')
    }

    // Validate products and stock
    for (const op of orderProducts) {
      const product =
        await this.prisma.product.findUnique({
          where: { id: op.productId },
          select: {
            id: true,
            quantity: true,
            price: true,
          },
        })
      if (!product) {
        throw new Error(
          `Product ${op.productId} not found`,
        )
      }
      if (product.quantity < op.quantity) {
        throw new Error(
          `Insufficient stock for product ${op.productId}`,
        )
      }
    }

    // Calculate total amount
    const productTotal = (
      await Promise.all(
        orderProducts.map(async (op) => {
          const product =
            await this.prisma.product.findUnique({
              where: { id: op.productId },
            })

          if (!product)
            throw new Error('Product not found')

          return product.price * op.quantity
        }),
      )
    ).reduce((sum, val) => sum + val, 0)
    const totalAmount =
      productTotal + (orderData.deliveryFee || 0)

    // if (payment.amount !== totalAmount) {
    //   throw new Error(`Payment amount (${payment.amount}) does not match total (${totalAmount})`);
    // }

    // Create order
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        client: { connect: { id: clientId } },
        payment: {
          create: {
            amount: totalAmount,
            method: payment.method,
            status:
              payment.status ||
              PaymentStatus.PENDING,
            qrCode: payment.qrCode,
          },
        },
        products: {
          create: orderProducts.map((item) => ({
            product: {
              connect: { id: item.productId },
            },
            quantity: item.quantity,
          })),
        },
      },
      select: {
        id: true,
        deliveryFee: true,
        deliveryAddress: true,
        qrCode: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            transactionDate: true,
            qrCode: true,
            createdAt: true,
          },
        },
        products: {
          select: {
            id: true,
            quantity: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                businessId: true,
                title: true,
                price: true,
                createdAt: true,
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
      },
    })

    // Update stock
    await Promise.all(
      order.products.map(
        (op: {
          quantity: number
          product: { id: string }
        }) =>
          this.prisma.product.update({
            where: { id: op.product.id },
            data: {
              stock: { decrement: op.quantity },
            },
          }),
      ),
    )

    // Handle profit-sharing for re-owned products and commissions for reposted products
    for (const op of order.products) {
      // ReOwnedProduct profit-sharing
      const reOwnedProduct =
        await this.prisma.reOwnedProduct.findFirst(
          {
            where: {
              newProductId: op.product.id,
            },
            select: {
              id: true,
              oldOwnerId: true,
              oldPrice: true,
              newPrice: true,
              quantity: true,
            },
          },
        )
      if (reOwnedProduct) {
        const markup =
          reOwnedProduct.newPrice -
          reOwnedProduct.oldPrice
        if (markup > 0) {
          const profitShare =
            markup * 0.2 * op.quantity // 20% of markup per unit
          await this.tokenTransactionService.create(
            {
              businessId:
                reOwnedProduct.oldOwnerId,
              reOwnedProductId: reOwnedProduct.id,
              amount: profitShare,
              type: TokenTransactionType.PROFIT_SHARE,
            },
          )
        }
      }

      // RepostedProduct commission
      const repostedProduct =
        await this.prisma.repostedProduct.findFirst(
          {
            where: { productId: op.product.id },
            select: {
              id: true,
              businessId: true,
            },
          },
        )
      if (repostedProduct) {
        const product =
          await this.prisma.product.findUnique({
            where: { id: op.product.id },
            select: { price: true },
          })

        if (!product)
          throw new Error('Product not found')

        const commission =
          product.price * 0.002 * op.quantity // 0.02% commission per unit
        await this.tokenTransactionService.create(
          {
            businessId:
              repostedProduct.businessId,
            repostedProductId: repostedProduct.id,
            amount: commission,
            type: TokenTransactionType.REPOST_COMMISSION,
          },
        )
      }
    }

    // Update totalProductsSold for businesses
    const businessIds = [
      ...new Set(
        order.products.map(
          (op) => op.product.businessId,
        ),
      ),
    ]
    await Promise.all(
      businessIds.map((businessId) =>
        this.prisma.business.update({
          where: { id: businessId },
          data: {
            totalProductsSold: {
              increment: order.products
                .filter(
                  (op) =>
                    op.product.businessId ===
                    businessId,
                )
                .reduce(
                  (sum, op) => sum + op.quantity,
                  0,
                ),
            },
          },
        }),
      ),
    )

    // Transform the data to match frontend expectations
    return {
      ...order,
      status: order.payment?.status || 'PENDING',
      products: order.products?.map((op) => ({
        ...op,
      })),
    }
  }

  async findAll() {
    const orders =
      await this.prisma.order.findMany({
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              transactionDate: true,
              qrCode: true,
              createdAt: true,
            },
          },
          products: {
            select: {
              id: true,
              quantity: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  businessId: true,
                  title: true,
                  price: true,
                  createdAt: true,
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
        },
      })

    // Transform the data to match frontend expectations
    return orders.map((order) => ({
      ...order,
      status: order.payment?.status || 'PENDING',
      products: order.products?.map((op) => ({
        ...op,
      })),
    }))
  }

  async findOne(id: string) {
    const order =
      await this.prisma.order.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              transactionDate: true,
              qrCode: true,
              createdAt: true,
            },
          },
          products: {
            select: {
              id: true,
              quantity: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  businessId: true,
                  title: true,
                  price: true,
                  createdAt: true,
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
        },
      })

    if (!order) return null

    // Transform the data to match frontend expectations
    return {
      ...order,
      status: order.payment?.status || 'PENDING',
      products: order.products?.map((op) => ({
        ...op,
      })),
    }
  }

  async update(
    id: string,
    updateOrderInput: UpdateOrderInput,
  ) {
    const { ...orderData } = updateOrderInput
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        deliveryAddress:
          orderData.deliveryAddress,
        qrCode: orderData.qrCode,
        deliveryFee: orderData.deliveryFee,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            transactionDate: true,
            qrCode: true,
            createdAt: true,
          },
        },
        products: {
          select: {
            id: true,
            quantity: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                businessId: true,
                title: true,
                price: true,
                createdAt: true,
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
      },
    })

    // Transform the data to match frontend expectations
    return {
      ...order,
      status: order.payment?.status || 'PENDING',
      products: order.products?.map((op) => ({
        ...op,
      })),
    }
  }

  async remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
      select: {
        id: true,
        deliveryFee: true,
      },
    })
  }

  async findBusinessOrders(
    businessId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string,
    date?: string,
  ) {
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      products: {
        some: {
          product: {
            businessId: businessId,
          },
        },
      },
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          client: {
            fullName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          id: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    // Add status filter
    if (status) {
      where.payment = {
        status: status,
      }
    }

    // Add date filter
    if (date) {
      const now = new Date()
      let startDate: Date
      let endDate: Date = now

      switch (date) {
        case 'TODAY':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          )
          break
        case 'THIS_WEEK':
          const dayOfWeek = now.getDay()
          startDate = new Date(
            now.getTime() -
              dayOfWeek * 24 * 60 * 60 * 1000,
          )
          startDate.setHours(0, 0, 0, 0)
          break
        case 'THIS_MONTH':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          )
          break
        case 'THIS_YEAR':
          startDate = new Date(
            now.getFullYear(),
            0,
            1,
          )
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              transactionDate: true,
              qrCode: true,
              createdAt: true,
            },
          },
          products: {
            select: {
              id: true,
              quantity: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  businessId: true,
                  title: true,
                  price: true,
                  createdAt: true,
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
        },
      }),
      this.prisma.order.count({ where }),
    ])

    // Transform the data to match frontend expectations
    const transformedOrders = orders.map(
      (order) => ({
        ...order,
        status:
          order.payment?.status || 'PENDING',
        products: order.products?.map((op) => ({
          ...op,
        })),
      }),
    )

    return {
      items: transformedOrders,
      total,
      page,
      limit,
    }
  }

  async findClientOrders(
    clientId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { clientId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              transactionDate: true,
              qrCode: true,
              createdAt: true,
            },
          },
          products: {
            select: {
              id: true,
              quantity: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  businessId: true,
                  title: true,
                  price: true,
                  createdAt: true,
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
        },
      }),
      this.prisma.order.count({
        where: { clientId },
      }),
    ])

    // Transform the data to match frontend expectations
    const transformedOrders = orders.map(
      (order) => ({
        ...order,
        status:
          order.payment?.status || 'PENDING',
        products: order.products?.map((op) => ({
          ...op,
        })),
      }),
    )

    return {
      items: transformedOrders,
      total,
      page,
      limit,
    }
  }

  async processPayment(
    orderId: string,
    input: any,
  ) {
    const order =
      await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
      })

    if (!order) {
      throw new Error('Order not found')
    }

    if (!order.payment) {
      throw new Error(
        'No payment found for this order',
      )
    }

    // Update payment status
    const updatedOrder =
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          payment: {
            update: {
              status: input.status || 'COMPLETED',
              transactionDate: new Date(),
            },
          },
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              transactionDate: true,
              qrCode: true,
              createdAt: true,
            },
          },
          products: {
            select: {
              id: true,
              quantity: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  businessId: true,
                  title: true,
                  price: true,
                  createdAt: true,
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
        },
      })

    // Transform the data to match frontend expectations
    return {
      ...updatedOrder,
      status:
        updatedOrder.payment?.status || 'PENDING',
      products: updatedOrder.products?.map(
        (op) => ({
          ...op,
        }),
      ),
    }
  }
}
