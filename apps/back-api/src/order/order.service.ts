import { Injectable } from '@nestjs/common';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from 'src/generated/prisma/enums';
import { TokenTransactionService } from 'src/token-transaction/token-transaction.service';
import { TokenTransactionType } from 'src/token-transaction/dto/create-token-transaction.input';
// Service
@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private tokenTransactionService: TokenTransactionService,
  ) {}

  async create(createOrderInput: CreateOrderInput) {
    const { clientId, orderProducts, payment, ...orderData } = createOrderInput;

    // Validate client
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new Error('Client not found');
    }

    // Validate products and stock
    for (const op of orderProducts) {
      const product = await this.prisma.product.findUnique({
        where: { id: op.productId },
        select: { id: true, stock: true, price: true },
      });
      if (!product) {
        throw new Error(`Product ${op.productId} not found`);
      }
      if (product.stock < op.quantity) {
        throw new Error(`Insufficient stock for product ${op.productId}`);
      }
    }

    // Calculate total amount
    const productTotal = (await Promise.all(
      orderProducts.map(async op => {
        const product = await this.prisma.product.findUnique({ where: { id: op.productId } });

        if (!product) throw new Error("Product not found")

        return product.price * op.quantity;
      })
    )).reduce((sum, val) => sum + val, 0);
    const totalAmount = productTotal + (orderData.deliveryFee || 0);
    if (payment.amount !== totalAmount) {
      throw new Error(`Payment amount (${payment.amount}) does not match total (${totalAmount})`);
    }

    // Create order
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        client: { connect: { id: clientId } },
        payment: {
          create: {
            amount: payment.amount,
            method: payment.method,
            status: payment.status || PaymentStatus.PENDING,
            qrCode: payment.qrCode,
          },
        },
        products: {
          create: orderProducts.map(item => ({
            product: { connect: { id: item.productId } },
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
        client: { select: { id: true, username: true, email: true, createdAt: true } },
        payment: { select: { id: true, amount: true, method: true, status: true, transactionDate: true, qrCode: true, createdAt: true } },
        products: { select: { id: true, quantity: true, createdAt: true, product: { select: { id: true, businessId: true, title: true, price: true, stock: true, createdAt: true } } } },
      },
    });

    // Update stock
    await Promise.all(
      order.products.map((op: { quantity: number; product: { id: string } }) =>
        this.prisma.product.update({
          where: { id: op.product.id },
          data: { stock: { decrement: op.quantity } },
        })
      )
    );

    // Handle profit-sharing for re-owned products and commissions for reposted products
    for (const op of order.products) {
      // ReOwnedProduct profit-sharing
      const reOwnedProduct = await this.prisma.reOwnedProduct.findFirst({
        where: { newProductId: op.product.id },
        select: { id: true, oldOwnerId: true, oldPrice: true, newPrice: true, quantity: true },
      });
      if (reOwnedProduct) {
        const markup = reOwnedProduct.newPrice - reOwnedProduct.oldPrice;
        if (markup > 0) {
          const profitShare = markup * 0.2 * op.quantity; // 20% of markup per unit
          await this.tokenTransactionService.create({
            businessId: reOwnedProduct.oldOwnerId,
            reOwnedProductId: reOwnedProduct.id,
            amount: profitShare,
            type: TokenTransactionType.PROFIT_SHARE,
          });
        }
      }

      // RepostedProduct commission
      const repostedProduct = await this.prisma.repostedProduct.findFirst({
        where: { productId: op.product.id },
        select: { id: true, businessId: true },
      });
      if (repostedProduct) {
        const product = await this.prisma.product.findUnique({ where: { id: op.product.id }, select: { price: true } });

        if (!product) throw new Error("Product not found")

        const commission = product.price * 0.003 * op.quantity; // 0.3% commission per unit
        await this.tokenTransactionService.create({
          businessId: repostedProduct.businessId,
          repostedProductId: repostedProduct.id,
          amount: commission,
          type: TokenTransactionType.REPOST_COMMISSION,
        });
      }
    }

    // Update totalProductsSold for businesses
    const businessIds = [...new Set(order.products.map(op => op.product.businessId))];
    await Promise.all(
      businessIds.map(businessId =>
        this.prisma.business.update({
          where: { id: businessId },
          data: {
            totalProductsSold: {
              increment: order.products
                .filter(op => op.product.businessId === businessId)
                .reduce((sum, op) => sum + op.quantity, 0),
            },
          },
        })
      )
    );

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        client: { select: { id: true, username: true, email: true, createdAt: true } },
        payment: { select: { id: true, amount: true, method: true, status: true, transactionDate: true, qrCode: true, createdAt: true } },
        products: { select: { id: true, quantity: true, createdAt: true, product: { select: { id: true, businessId: true, title: true, price: true, stock: true, createdAt: true } } } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, username: true, email: true, createdAt: true } },
        payment: { select: { id: true, amount: true, method: true, status: true, transactionDate: true, qrCode: true, createdAt: true } },
        products: { select: { id: true, quantity: true, createdAt: true, product: { select: { id: true, businessId: true, title: true, price: true, stock: true, createdAt: true } } } },
      },
    });
  }

  async update(id: string, updateOrderInput: UpdateOrderInput) {
    const { ...orderData } = updateOrderInput;
    return this.prisma.order.update({
      where: { id },
      data: {
        deliveryAddress: orderData.deliveryAddress,
        qrCode: orderData.qrCode,
        deliveryFee: orderData.deliveryFee,
      },
      select: {
        id: true,
        deliveryFee: true,
        deliveryAddress: true,
        qrCode: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { id: true, username: true, email: true } },
        payment: { select: { id: true, amount: true, method: true, status: true } },
        products: { select: { id: true, quantity: true, createdAt: true, product: { select: { id: true, businessId: true, title: true } } } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
      select: {
        id: true,
        deliveryFee: true,
      },
    });
  }
}