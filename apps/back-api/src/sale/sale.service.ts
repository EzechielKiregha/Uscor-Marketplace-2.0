import {
  Inject,
  Injectable,
} from '@nestjs/common'
import { CreateSaleInput } from './dto/create-sale.input'
import { UpdateSaleInput } from './dto/update-sale.input'
import { CreateReturnInput } from './dto/create-return.input'
import { PrismaService } from '../prisma/prisma.service'
import { AccountRechargeService } from '../account-recharge/account-recharge.service'
import { TokenTransactionService } from '../token-transaction/token-transaction.service'
import {
  Country,
  RechargeMethod,
} from '../account-recharge/dto/create-account-recharge.input'
import { TokenTransactionType } from '../token-transaction/dto/create-token-transaction.input'
import { StoreService } from '../store/store.service'
import { WorkerService } from '../worker/worker.service'
import { BusinessService } from '../business/business.service'
import { PaymentTransactionService } from '../payment-transaction/payment-transaction.service'
import { ProductService } from '../product/product.service'
import { LoyaltyService } from '../loyalty-program/loyalty-program.service'
import { GenerateReceiptInput } from './dto/receipt.input'
import { promisify } from 'util'
import { exec } from 'child_process'
import { createWriteStream, mkdir } from 'fs'
import { subDays } from 'date-fns'
import {
  PaymentMethod,
  PaymentStatus,
} from '../payment-transaction/dto/create-payment-transaction.input'
import { PubSub } from 'graphql-subscriptions'
import { AuthPayload } from '../auth/entities/auth-payload.entity'
import { UpdateSaleProductInput } from './dto/update-sale-product.input'
import {
  CloseSaleInput,
  PaymentDetailsInput,
} from './dto/close-sale.input'
import { Worker } from '../generated/prisma/client'
const execAsync = promisify(exec)
const mkdirAsync = promisify(mkdir)
// import PDFDocument from 'pdfkit';
const PDFDocument = require('pdfkit')

// Chart data point types
interface DailyChartPoint {
  name: string
  startHour: number
  endHour: number
}

interface PeriodChartPoint {
  name: string
  date: Date
}

type ChartDataPoint =
  | DailyChartPoint
  | PeriodChartPoint

// Type guards
function isDailyChartPoint(
  point: ChartDataPoint,
): point is DailyChartPoint {
  return (
    'startHour' in point && 'endHour' in point
  )
}

function isPeriodChartPoint(
  point: ChartDataPoint,
): point is PeriodChartPoint {
  return 'date' in point
}

// Service
@Injectable()
export class SaleService {
  constructor(
    private prisma: PrismaService,
    private storeService: StoreService,
    private workerService: WorkerService,
    private businessService: BusinessService,
    private productService: ProductService,
    private accountRechargeService: AccountRechargeService,
    private tokenTransactionService: TokenTransactionService,
    private paymentTransactionService: PaymentTransactionService,
    private loyaltyService: LoyaltyService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async create(
    createSaleInput: CreateSaleInput,
    user: AuthPayload,
  ) {
    const {
      storeId,
      workerId,
      clientId,
      totalAmount,
      discount,
      paymentMethod,
      saleProducts,
    } = createSaleInput

    // Validate store and access
    await this.storeService.verifyStoreAccess(
      storeId,
      user,
    )

    let worker: Worker | null = null
    let actualWorkerId: string | undefined =
      workerId

    // Handle worker validation based on user role
    if (user.role === 'worker') {
      // Workers can only create sales for themselves
      worker = await this.workerService.findOne(
        user.id,
      )
      if (!worker)
        throw new Error('Worker not found')
      actualWorkerId = user.id
    } else if (user.role === 'business') {
      // Business owners can create sales with or without a specific worker
      if (workerId) {
        worker =
          await this.workerService.findOne(
            workerId,
          )
        if (!worker)
          throw new Error('Worker not found')
        if (worker.businessId !== user.id) {
          throw new Error(
            'Business can only create sales for workers in their business',
          )
        }
        actualWorkerId = workerId
      } else {
        // Business sale without specific worker
        actualWorkerId = undefined
      }
    } else {
      throw new Error(
        'Unauthorized to create sales',
      )
    }

    // Validate client (if provided)
    if (clientId) {
      const client =
        await this.prisma.client.findUnique({
          where: { id: clientId },
        })
      if (!client) {
        throw new Error('Client not found')
      }
    }

    if (saleProducts) {
      // Validate products and quantity
      for (const sp of saleProducts) {
        const product =
          await this.productService.findOne(
            sp.productId,
          )
        if (!product)
          throw new Error('Product not found')
        if (product.storeId !== storeId) {
          throw new Error(
            `Product ${sp.productId} does not belong to store ${storeId}`,
          )
        }
        if (product.quantity < sp.quantity) {
          throw new Error(
            `Insufficient quantity for product ${sp.productId}`,
          )
        }
      }
    }

    // Calculate total
    let calculatedTotal = 0
    let sales = new Array()

    if (saleProducts) {
      for (const sp of saleProducts) {
        const p =
          await this.prisma.product.findUnique({
            where: { id: sp.productId },
            select: {
              id: true,
              quantity: true,
              price: true,
              createdAt: true,
            },
          })
        if (!p)
          throw new Error(
            'This product does not exist this store',
          )
        calculatedTotal =
          calculatedTotal + p.price * sp.quantity

        sales.push({
          ...sp,
          uniquePrice: p.price,
        })
      }
    }

    const finalTotal =
      calculatedTotal - (discount || 0)
    if (totalAmount !== finalTotal) {
      // throw new Error(`Total amount (${totalAmount}) does not match calculated total (${finalTotal})`);
    }

    // Handle token payment
    if (paymentMethod === 'TOKEN') {
      let bId = ''
      if (worker) bId = worker.businessId
      else bId = user.id
      const balance =
        await this.accountRechargeService.getBalance(
          clientId || bId,
          clientId ? 'client' : 'business',
          RechargeMethod.TOKEN,
        )
      if (balance < finalTotal) {
        throw new Error(
          'Insufficient balance for token payment',
        )
      }
      await this.accountRechargeService.create(
        {
          clientId: clientId || undefined,
          businessId: clientId ? undefined : bId,
          amount: -finalTotal,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
        },
        clientId || bId,
        clientId ? 'client' : 'business',
      )
    }

    // Create sale
    const sale = await this.prisma.sale.create({
      data: {
        store: { connect: { id: storeId } },
        worker: { connect: { id: workerId } },
        client: clientId
          ? { connect: { id: clientId } }
          : undefined,
        totalAmount: finalTotal,
        discount: discount || 0,
        paymentMethod: paymentMethod || 'CASH',
        status:
          paymentMethod === 'TOKEN'
            ? 'CLOSED'
            : 'OPEN',
        saleProducts:
          sales.length > 0
            ? {
                create: sales.map((sp) => ({
                  product: {
                    connect: { id: sp.productId },
                  },
                  quantity: sp.quantity,
                  price: sp.uniquePrice,
                  modifiers: sp.modifiers,
                })),
              }
            : undefined,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            businessId: true,
            address: true,
            createdAt: true,
          },
        },
        worker: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
          },
        },
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
        saleProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                quantity: true,
                createdAt: true,
              },
            },
          },
        },
        returns: true,
      },
    })

    // Update quantity
    if (saleProducts) {
      await Promise.all(
        saleProducts.map((sp) =>
          this.productService.updateStock(
            sp.productId,
            {
              quantity: {
                decrement: sp.quantity,
              },
            },
          ),
        ),
      )
    }

    // Handle commissions for RepostedProduct and profit-sharing for ReOwnedProduct
    for (const sp of sale.saleProducts) {
      const reOwnedProduct =
        await this.prisma.reOwnedProduct.findFirst(
          {
            where: { newProductId: sp.productId },
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
            markup * 0.2 * sp.quantity // 20% of markup
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

      const repostedProduct =
        await this.prisma.repostedProduct.findFirst(
          {
            where: { productId: sp.productId },
            select: {
              id: true,
              businessId: true,
            },
          },
        )
      if (repostedProduct) {
        const commission =
          sp.price * 0.002 * sp.quantity // 0.02% commission
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

    // Update business sales metrics
    const businessId = worker
      ? worker.businessId
      : user.id
    await this.businessService.updateTotalProuctSold(
      businessId,
      {
        totalProductsSold: {
          increment: saleProducts
            ? saleProducts.reduce(
                (sum, sp) => sum + sp.quantity,
                0,
              )
            : 0,
        },
      },
    )

    // Award loyalty points if sale is CLOSED
    if (
      sale.status === 'CLOSED' &&
      sale.clientId
    ) {
      const loyaltyProgram =
        await this.prisma.loyaltyProgram.findFirst(
          {
            where: {
              businessId: sale.store.businessId,
            },
          },
        )
      if (loyaltyProgram) {
        const points =
          sale.totalAmount *
          loyaltyProgram.pointsPerPurchase
        await this.loyaltyService.createPointsTransaction(
          {
            clientId: sale.clientId,
            loyaltyProgramId: loyaltyProgram.id,
            points,
          },
          user,
        )
      }
    }

    await this.pubSub.publish(
      `sale_created_${sale.storeId}`,
      {
        saleCreated: sale,
      },
    )

    return sale
  }

  async update(
    id: string,
    updateSaleInput: UpdateSaleInput,
    user: AuthPayload,
  ) {
    const {
      clientId,
      totalAmount,
      discount,
      paymentMethod,
      saleProducts,
    } = updateSaleInput

    const sale =
      await this.prisma.sale.findUnique({
        where: { id },
        include: {
          saleProducts: true,
          store: true,
        },
      })
    if (!sale) {
      throw new Error('Sale not found')
    }
    await this.storeService.verifyStoreAccess(
      sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only update their own sales',
      )
    }
    if (sale.status !== 'OPEN') {
      throw new Error(
        'Can only update OPEN sales',
      )
    }

    // Validate updates
    if (clientId) {
      const client =
        await this.prisma.client.findUnique({
          where: { id: clientId },
        })
      if (!client) {
        throw new Error('Client not found')
      }
    }
    if (saleProducts) {
      for (const sp of saleProducts) {
        const product =
          await this.productService.findOne(
            sp.productId,
          )
        if (!product)
          throw new Error('Product not found')
        if (product.storeId !== sale.storeId) {
          throw new Error(
            `Product ${sp.productId} does not belong to store ${sale.storeId}`,
          )
        }
      }
    }

    // Calculate total if updated
    let finalTotal = sale.totalAmount
    let calculatedTotal = 0
    let sales = new Array()
    if (saleProducts || discount !== undefined) {
      if (saleProducts) {
        for (const sp of saleProducts) {
          const p =
            await this.prisma.product.findUnique({
              where: { id: sp.productId },
              select: {
                id: true,
                quantity: true,
                price: true,
                createdAt: true,
              },
            })
          if (!p)
            throw new Error(
              'This product does not exist this store',
            )
          calculatedTotal =
            calculatedTotal +
            p.price * sp.quantity

          sales.push({
            ...sp,
            uniquePrice: p.price,
          })
        }
      } else {
        calculatedTotal = sale.totalAmount
      }
      //  const calculatedTotal = saleProducts
      //    ? saleProducts.reduce((sum, sp) => sum + sp.price * sp.quantity, 0)
      //    : sale.totalAmount;

      finalTotal =
        calculatedTotal -
        (discount !== undefined
          ? discount
          : sale.discount)
    }
    if (
      totalAmount &&
      totalAmount !== finalTotal
    ) {
      // throw new Error(`Total amount (${totalAmount}) does not match calculated total (${finalTotal})`);
    }

    // Update sale
    const updatedSale =
      await this.prisma.sale.update({
        where: { id },
        data: {
          client: clientId
            ? { connect: { id: clientId } }
            : undefined,
          totalAmount: finalTotal,
          discount:
            discount !== undefined
              ? discount
              : sale.discount,
          paymentMethod,
          saleProducts: sales
            ? {
                deleteMany: {},
                create: sales.map((sp) => ({
                  product: {
                    connect: { id: sp.productId },
                  },
                  quantity: sp.quantity,
                  price: sp.price
                    ? sp.price
                    : sp.uniquePrice,
                  modifiers: sp.modifiers,
                })),
              }
            : undefined,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              createdAt: true,
            },
          },
          worker: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            },
          },
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
          saleProducts: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  quantity: true,
                  createdAt: true,
                },
              },
            },
          },
          returns: true,
        },
      })

    // Update quantity if saleProducts changed
    if (saleProducts) {
      await Promise.all(
        sale.saleProducts.map((sp) =>
          this.productService.updateStock(
            sp.productId,
            {
              quantity: {
                increment: sp.quantity,
              },
            },
          ),
        ),
      )
      await Promise.all(
        saleProducts.map((sp) =>
          this.productService.updateStock(
            sp.productId,
            {
              quantity: {
                decrement: sp.quantity,
              },
            },
          ),
        ),
      )
    }

    await this.pubSub.publish(
      `sale_updated_${updatedSale.storeId}`,
      {
        saleUpdated: updatedSale,
      },
    )

    return updatedSale
  }

  async close(
    closeSaleInput: CloseSaleInput,
    user: AuthPayload,
  ) {
    const {
      saleId,
      paymentMethod,
      status,
      paymentDetails,
    } = closeSaleInput

    const sale =
      await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          saleProducts: true,
          store: true,
        },
      })
    if (!sale) {
      throw new Error('Sale not found')
    }
    await this.storeService.verifyStoreAccess(
      sale.storeId,
      user,
    )

    // Allow business role to perform all operations
    // Only restrict workers to their own sales
    if (
      user.role === 'worker' &&
      sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only close their own sales',
      )
    }
    // Business users can close any sale in their business (already verified by verifyStoreAccess)
    if (sale.status !== 'OPEN') {
      throw new Error('Sale is not OPEN')
    }

    // Handle different payment methods
    await this.processPayment(
      sale,
      paymentMethod,
      paymentDetails,
      user,
    )

    // Award loyalty points if closing to CLOSED
    if (
      (status || 'CLOSED') === 'CLOSED' &&
      sale.clientId
    ) {
      const loyaltyProgram =
        await this.prisma.loyaltyProgram.findFirst(
          {
            where: {
              businessId: sale.store.businessId,
            },
          },
        )
      if (loyaltyProgram) {
        const points =
          sale.totalAmount *
          loyaltyProgram.pointsPerPurchase
        await this.loyaltyService.createPointsTransaction(
          {
            clientId: sale.clientId,
            loyaltyProgramId: loyaltyProgram.id,
            points,
          },
          user,
        )
      }
    }

    const closedSale =
      await this.prisma.sale.update({
        where: { id: saleId },
        data: {
          paymentMethod:
            paymentMethod || sale.paymentMethod,
          status: status || 'CLOSED',
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              createdAt: true,
            },
          },
          worker: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            },
          },
          client: sale.clientId
            ? {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  createdAt: true,
                },
              }
            : false,
          saleProducts: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  quantity: true,
                  createdAt: true,
                },
              },
            },
          },
          returns: true,
        },
      })

    await this.pubSub.publish(
      `sale_updated_${sale.storeId}`,
      {
        saleUpdated: sale,
      },
    )

    return closedSale
  }

  private async processPayment(
    sale: any,
    paymentMethod: string,
    paymentDetails:
      | PaymentDetailsInput
      | undefined,
    user: AuthPayload,
  ) {
    // Get worker info if sale has workerId, otherwise use business info
    let worker: Worker | null
    let businessId = ''

    if (sale.workerId) {
      worker = await this.workerService.findOne(
        sale.workerId,
      )
      if (!worker)
        throw new Error('Worker not found')
      businessId = worker.businessId
    } else {
      // If no worker, get business from store
      businessId = sale.store.businessId
    }

    // If current user is business, they can process any sale in their business
    if (
      user.role === 'business' &&
      user.id !== businessId
    ) {
      throw new Error(
        'Business can only process payments for their own sales',
      )
    }

    switch (paymentMethod) {
      case 'TOKEN':
        await this.processTokenPayment(
          sale,
          { businessId },
          user,
        )
        break
      case 'MOBILE_MONEY':
        await this.processMobileMoneyPayment(
          sale,
          paymentDetails,
          { businessId },
          user,
        )
        break
      case 'CARD':
        await this.processCardPayment(
          sale,
          paymentDetails,
          { businessId },
          user,
        )
        break
      case 'CASH':
        // Cash payment doesn't require additional processing
        break
      default:
        throw new Error(
          `Unsupported payment method: ${paymentMethod}`,
        )
    }
  }

  private async processTokenPayment(
    sale: any,
    workerInfo: any,
    user: AuthPayload,
  ) {
    // Calculate token amount (1 uTn = $10)
    const tokenAmount = sale.totalAmount / 10

    // Check if client or business is paying
    const payerId = sale.clientId || user.id
    const payerType = sale.clientId
      ? 'client'
      : 'business'

    const balance =
      await this.accountRechargeService.getBalance(
        payerId,
        payerType,
        RechargeMethod.TOKEN,
      )
    if (balance < sale.totalAmount) {
      throw new Error(
        'Insufficient token balance for payment',
      )
    }

    // Deduct from payer (client or business)
    await this.accountRechargeService.create(
      {
        clientId: sale.clientId || undefined,
        businessId: sale.clientId
          ? undefined
          : workerInfo.businessId,
        amount: -tokenAmount,
        method: RechargeMethod.TOKEN,
        origin: Country.DRC,
      },
      payerId,
      payerType,
    )

    // Credit to business (if client paid) or worker's business (if business paid)
    if (sale.clientId) {
      // Client paid, credit business
      await this.accountRechargeService.create(
        {
          businessId: workerInfo.businessId,
          amount: sale.totalAmount,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
        },
        workerInfo.businessId,
        'business',
      )
    }
  }

  private async processMobileMoneyPayment(
    sale: any,
    paymentDetails:
      | PaymentDetailsInput
      | undefined,
    workerInfo: any,
    user: AuthPayload,
  ) {
    if (
      !paymentDetails?.mobileMoneyMethod ||
      !paymentDetails?.country
    ) {
      throw new Error(
        'Mobile money method and country are required for mobile money payments',
      )
    }

    // Generate mock payment code based on mobile money type and country
    const paymentCode =
      this.generateMobileMoneyCode(
        paymentDetails.mobileMoneyMethod,
        paymentDetails.country,
      )

    // Create payment transaction record
    await this.paymentTransactionService.create(
      {
        amount: sale.totalAmount,
        method: PaymentMethod.MOBILE_MONEY,
        status:
          paymentDetails.operatorTransactionId
            ? PaymentStatus.COMPLETED
            : PaymentStatus.PENDING,
        qrCode: paymentCode,
      },
      sale.clientId,
    )

    // If operator transaction ID is provided, mark as completed
    if (paymentDetails.operatorTransactionId) {
      // Credit business account
      await this.accountRechargeService.create(
        {
          businessId: workerInfo.businessId,
          amount: sale.totalAmount,
          method:
            paymentDetails.mobileMoneyMethod,
          origin: paymentDetails.country,
        },
        workerInfo.businessId,
        'business',
      )
    }
  }

  private async processCardPayment(
    sale: any,
    paymentDetails:
      | PaymentDetailsInput
      | undefined,
    workerInfo: any,
    user: AuthPayload,
  ) {
    if (
      !paymentDetails?.cardNumber ||
      !paymentDetails?.cardHolderName ||
      !paymentDetails?.expiryDate ||
      !paymentDetails?.cvv
    ) {
      throw new Error(
        'Complete card information is required for card payments',
      )
    }

    // Simulate card processing
    const isValidCard = this.validateCardDetails(
      paymentDetails,
    )
    if (!isValidCard) {
      throw new Error('Invalid card details')
    }

    // Create payment transaction record
    await this.paymentTransactionService.create(
      {
        amount: sale.totalAmount,
        method: PaymentMethod.CARD,
        status: PaymentStatus.COMPLETED,
      },
      sale.clientId,
    )

    // Credit business account
    await this.accountRechargeService.create(
      {
        businessId: workerInfo.businessId,
        amount: sale.totalAmount,
        method: RechargeMethod.TOKEN, // Convert to platform tokens
        origin: Country.DRC,
      },
      workerInfo.businessId,
      'business',
    )
  }

  private generateMobileMoneyCode(
    method: RechargeMethod,
    country: Country,
  ): string {
    const prefixes = {
      [RechargeMethod.MTN_MONEY]: 'MTN',
      [RechargeMethod.AIRTEL_MONEY]: 'AIR',
      [RechargeMethod.ORANGE_MONEY]: 'ORA',
      [RechargeMethod.MPESA]: 'MPE',
    }

    const countryCode = country.substring(0, 2)
    const prefix = prefixes[method] || 'MOB'
    const randomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()

    return `*${prefix}*${countryCode}*${randomCode}#`
  }

  private validateCardDetails(
    paymentDetails: PaymentDetailsInput,
  ): boolean {
    // Basic card validation (in real implementation, use proper card validation)
    const cardNumber =
      paymentDetails.cardNumber?.replace(
        /\s/g,
        '',
      )
    if (
      !cardNumber ||
      cardNumber.length < 13 ||
      cardNumber.length > 19
    ) {
      return false
    }

    // Check expiry date format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (
      !paymentDetails.expiryDate ||
      !expiryRegex.test(paymentDetails.expiryDate)
    ) {
      return false
    }

    // Check CVV (3-4 digits)
    const cvvRegex = /^\d{3,4}$/
    if (
      !paymentDetails.cvv ||
      !cvvRegex.test(paymentDetails.cvv)
    ) {
      return false
    }

    return true
  }

  async createReturn(
    createReturnInput: CreateReturnInput,
    user: AuthPayload,
  ) {
    const { saleId, reason } = createReturnInput

    const sale =
      await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          saleProducts: true,
          store: true,
        },
      })
    if (!sale) {
      throw new Error('Sale not found')
    }
    await this.storeService.verifyStoreAccess(
      sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only process returns for their own sales',
      )
    }
    if (sale.status === 'REFUNDED') {
      throw new Error('Sale already refunded')
    }

    // Revert quantity
    await Promise.all(
      sale.saleProducts.map((sp) =>
        this.productService.updateStock(
          sp.productId,
          {
            quantity: { increment: sp.quantity },
          },
        ),
      ),
    )

    // Refund token payment if applicable
    if (sale.paymentMethod === 'TOKEN') {
      const worker =
        await this.workerService.findOne(
          sale.workerId,
        )
      if (!worker)
        throw new Error('Worker not found')
      await this.accountRechargeService.create(
        {
          clientId: sale.clientId || undefined,
          businessId: sale.clientId
            ? undefined
            : worker.businessId,
          amount: sale.totalAmount,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
        },
        sale.clientId || worker.businessId,
        sale.clientId ? 'client' : 'business',
      )
    }

    const returnRecord =
      await this.prisma.return.create({
        data: {
          sale: { connect: { id: saleId } },
          reason,
          status: 'REFUNDED',
        },
        include: { sale: true },
      })

    await this.prisma.sale.update({
      where: { id: saleId },
      data: { status: 'REFUNDED' },
    })

    return returnRecord
  }

  async findAll(
    storeId: string,
    user: AuthPayload,
  ) {
    await this.storeService.verifyStoreAccess(
      storeId,
      user,
    )
    return this.prisma.sale.findMany({
      where: { storeId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            createdAt: true,
          },
        },
        worker: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        saleProducts: {
          select: {
            id: true,
            quantity: true,
            price: true,
            modifiers: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                medias: {
                  select: { url: true },
                },
              },
            },
          },
        },
        returns: {
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, user: AuthPayload) {
    const sale =
      await this.prisma.sale.findUnique({
        where: { id },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              createdAt: true,
            },
          },
          worker: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          saleProducts: {
            select: {
              id: true,
              quantity: true,
              price: true,
              modifiers: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  price: true,
                  medias: {
                    select: { url: true },
                  },
                },
              },
            },
          },
          returns: {
            select: {
              id: true,
              reason: true,
              status: true,
              createdAt: true,
            },
          },
        },
      })
    if (!sale) {
      throw new Error('Sale not found')
    }
    await this.storeService.verifyStoreAccess(
      sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only view their own sales',
      )
    }
    return sale
  }

  async generateReceipt(
    input: GenerateReceiptInput,
    user: AuthPayload,
  ) {
    const { saleId, email } = input

    const sale =
      await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          store: true,
          worker: true,
          client: true,
          saleProducts: {
            include: { product: true },
          },
        },
      })
    if (!sale) throw new Error('Sale not found')
    await this.storeService.verifyStoreAccess(
      sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only generate receipts for their own sales',
      )
    }

    let pointsEarned = 0
    if (sale.clientId) {
      const loyaltyProgram =
        await this.prisma.loyaltyProgram.findFirst(
          {
            where: {
              businessId: sale.store.businessId,
            },
          },
        )
      if (loyaltyProgram) {
        pointsEarned =
          sale.totalAmount *
          loyaltyProgram.pointsPerPurchase
      }
    }

    const latexContent = `
\\documentclass[a4paper]{article}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{booktabs}
\\usepackage{pdflscape}
\\usepackage{DejaVuSans}
\\renewcommand{\\familydefault}{\\sfdefault}

\\begin{document}
\\begin{center}
  \\textbf{Receipt - ${sale.store.name}} \\\\
  \\small{${sale.store.address || 'No address provided'}} \\\\
  \\small{Sale ID: ${sale.id}} \\\\
  \\small{Date: ${sale.createdAt.toISOString().split('T')[0]}} \\\\
  \\small{Worker: ${sale.worker.fullName}} \\\\
  ${sale.client ? `\\small{Customer: ${sale.client.username}} \\\\` : ''}
\\end{center}

\\vspace{0.5cm}

\\begin{tabular}{llrr}
  \\toprule
  \\textbf{Item} & \\textbf{Modifiers} & \\textbf{Quantity} & \\textbf{Price} \\\\
  \\midrule
  ${sale.saleProducts
    .map(
      (sp) =>
        `${sp.product.title} & ${sp.modifiers ? JSON.stringify(sp.modifiers).replace(/"/g, '') : '-'} & ${sp.quantity} & \\$${sp.price.toFixed(2)} \\\\`,
    )
    .join('\n')}
  \\bottomrule
\\end{tabular}

\\vspace{0.5cm}

\\begin{flushright}
  \\textbf{Subtotal:} \\$${sale.totalAmount.toFixed(2)} \\\\
  \\textbf{Discount:} \\$${sale.discount.toFixed(2)} \\\\
  \\textbf{Total:} \\$${(sale.totalAmount - sale.discount).toFixed(2)} \\\\
  \\textbf{Payment Method:} ${sale.paymentMethod} \\\\
  ${pointsEarned > 0 ? `\\textbf{Points Earned:} ${pointsEarned.toFixed(2)}` : ''}
\\end{flushright}

\\end{document}
`

    const fileName = `receipt_${sale.id}.tex`
    const outputDir = './receipts'
    // await execAsync(`mkdir -p ${outputDir}`);
    await mkdirAsync(outputDir, {
      recursive: true,
    })

    const stream = createWriteStream(
      `${outputDir}/${fileName}`,
    )

    await new Promise((resolve, reject) => {
      stream.write(latexContent)
      stream.on('finish', () => resolve)
      stream.on('error', reject)
    })
    // await new Promise((resolve, reject) => {
    //   createWriteStream(`${outputDir}/${fileName}`)
    //     .write(latexContent)
    //     .on('finish', () => resolve)
    //     .on('error', reject);
    // });
    await execAsync(
      `latexmk -pdf -output-directory=${outputDir} ${outputDir}/${fileName}`,
    )

    let emailSent = false
    if (email) {
      console.log(
        `Simulated sending receipt to ${email}`,
      )
      emailSent = true
    }

    return {
      filePath: `${outputDir}/receipt_${sale.id}.pdf`,
      emailSent,
    }
  }

  async generateReceiptWithPDFKit(
    input: GenerateReceiptInput,
    user: AuthPayload,
  ) {
    const { saleId, email } = input

    const sale =
      await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          store: true,
          worker: true,
          client: true,
          saleProducts: {
            include: { product: true },
          },
        },
      })
    if (!sale) throw new Error('Sale not found')
    await this.storeService.verifyStoreAccess(
      sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only generate receipts for their own sales',
      )
    }

    let pointsEarned = 0
    if (sale.clientId) {
      const loyaltyProgram =
        await this.prisma.loyaltyProgram.findFirst(
          {
            where: {
              businessId: sale.store.businessId,
            },
          },
        )
      if (loyaltyProgram) {
        pointsEarned =
          sale.totalAmount *
          loyaltyProgram.pointsPerPurchase
      }
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    })
    const fileName = `receipt_pdfkit_${sale.id}.pdf`
    const outputDir = './receipts'
    await mkdirAsync(outputDir, {
      recursive: true,
    })
    const stream = createWriteStream(
      `${outputDir}/${fileName}`,
    )

    doc.pipe(stream)

    // Header
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(`Receipt - ${sale.store.name}`, {
        align: 'center',
      })
    doc.font('Helvetica').fontSize(10)
    doc.text(
      sale.store.address || 'No address provided',
      { align: 'center' },
    )
    doc.text(`Sale ID: ${sale.id}`, {
      align: 'center',
    })
    doc.text(
      `Date: ${sale.createdAt.toISOString().split('T')[0]}`,
      { align: 'center' },
    )
    doc.text(`Worker: ${sale.worker.fullName}`, {
      align: 'center',
    })
    if (sale.client) {
      doc.text(
        `Customer: ${sale.client.username}`,
        { align: 'center' },
      )
    }
    doc.moveDown(2)

    // Items Table
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Items', { align: 'left' })
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(10)
    doc.text('Item', 50, doc.y, {
      continued: true,
    })
    doc.text('Modifiers', 200, doc.y, {
      continued: true,
    })
    doc.text('Qty', 350, doc.y, {
      continued: true,
    })
    doc.text('Price', 450, doc.y, {
      align: 'right',
    })
    doc.moveDown(0.5)
    doc.text('-'.repeat(100), { align: 'left' })

    sale.saleProducts.forEach((sp) => {
      doc.text(sp.product.title, 50, doc.y, {
        continued: true,
      })
      doc.text(
        sp.modifiers
          ? JSON.stringify(sp.modifiers).replace(
              /"/g,
              '',
            )
          : '-',
        200,
        doc.y,
        { continued: true },
      )
      doc.text(
        sp.quantity.toString(),
        350,
        doc.y,
        { continued: true },
      )
      doc.text(
        `$${sp.price.toFixed(2)}`,
        450,
        doc.y,
        { align: 'right' },
      )
      doc.moveDown(0.5)
    })

    doc.text('-'.repeat(100), { align: 'left' })
    doc.moveDown(1)

    // Totals
    doc.font('Helvetica-Bold').fontSize(12)
    doc.text(
      `Subtotal: $${sale.totalAmount.toFixed(2)}`,
      { align: 'right' },
    )
    doc.text(
      `Discount: $${sale.discount.toFixed(2)}`,
      { align: 'right' },
    )
    doc.text(
      `Total: $${(sale.totalAmount - sale.discount).toFixed(2)}`,
      { align: 'right' },
    )
    doc.text(
      `Payment Method: ${sale.paymentMethod}`,
      { align: 'right' },
    )
    if (pointsEarned > 0) {
      doc.text(
        `Points Earned: ${pointsEarned.toFixed(2)}`,
        { align: 'right' },
      )
    }

    doc.end()

    await new Promise((resolve, reject) => {
      stream.on('finish', () => resolve)
      stream.on('error', reject)
    })

    let emailSent = false
    if (email) {
      console.log(
        `Simulated sending receipt to ${email}`,
      )
      emailSent = true
    }

    return {
      filePath: `${outputDir}/${fileName}`,
      emailSent,
    }
  }

  // Add these methods to your existing SaleService class

  async findActiveSales(
    storeId: string,
    user: AuthPayload,
  ) {
    await this.storeService.verifyStoreAccess(
      storeId,
      user,
    )

    const whereClause: any = {
      storeId,
      status: 'OPEN',
    }

    if (user.role === 'worker') {
      whereClause.workerId = user.id
    }

    return this.prisma.sale.findMany({
      where: whereClause,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            createdAt: true,
          },
        },
        worker: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        saleProducts: {
          select: {
            id: true,
            quantity: true,
            price: true,
            modifiers: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                medias: {
                  select: { url: true },
                },
              },
            },
          },
        },
        returns: {
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findSalesWithPagination(
    params: {
      storeId?: string
      workerId?: string
      startDate?: Date
      endDate?: Date
      status?: string
      page?: number
      limit?: number
    },
    user: AuthPayload,
  ) {
    const {
      storeId,
      workerId,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
    } = params

    if (storeId) {
      await this.storeService.verifyStoreAccess(
        storeId,
        user,
      )
    }

    const whereClause: any = {}

    if (storeId) whereClause.storeId = storeId
    if (workerId) whereClause.workerId = workerId
    if (status) whereClause.status = status
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate)
        whereClause.createdAt.gte = startDate
      if (endDate)
        whereClause.createdAt.lte = endDate
    }

    if (user.role === 'worker' && !workerId) {
      whereClause.workerId = user.id
    }

    const [items, total] = await Promise.all([
      this.prisma.sale.findMany({
        where: whereClause,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              createdAt: true,
            },
          },
          worker: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          saleProducts: {
            select: {
              id: true,
              quantity: true,
              price: true,
              modifiers: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  price: true,
                  medias: {
                    select: { url: true },
                  },
                },
              },
            },
          },
          returns: {
            select: {
              id: true,
              reason: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sale.count({
        where: whereClause,
      }),
    ])

    return { items, total, page, limit }
  }

  async getSalesDashboard(
    storeId: string,
    period: string = 'day',
    user: AuthPayload,
  ) {
    await this.storeService.verifyStoreAccess(
      storeId,
      user,
    )

    const now = new Date()
    let startDate: Date
    let chartDataPoints: ChartDataPoint[] = []

    switch (period) {
      case 'week':
        startDate = subDays(now, 7)
        chartDataPoints =
          this.generateWeeklyChartPoints()
        break
      case 'month':
        startDate = subDays(now, 30)
        chartDataPoints =
          this.generateMonthlyChartPoints()
        break
      default:
        startDate = subDays(now, 1)
        chartDataPoints =
          this.generateDailyChartPoints()
    }

    const whereClause: any = {
      storeId,
      createdAt: { gte: startDate },
      status: { not: 'REFUNDED' },
    }

    if (user.role === 'worker') {
      whereClause.workerId = user.id
    }

    const [
      salesMetrics,
      topProductsData,
      paymentMethodsData,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: whereClause,
        _count: true,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),

      this.prisma.saleProduct.groupBy({
        by: ['productId'],
        where: {
          sale: whereClause,
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      this.prisma.sale.groupBy({
        by: ['paymentMethod'],
        where: whereClause,
        _count: true,
        _sum: { totalAmount: true },
      }),
    ])

    // Get product details for top products
    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product =
          await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, title: true },
          })
        return {
          id: product?.id,
          title: product?.title,
          quantitySold: item._sum.quantity || 0,
        }
      }),
    )

    // Generate chart data with actual sales data
    const chartData =
      await this.generateChartData(
        storeId,
        period,
        user,
        chartDataPoints,
      )

    return {
      totalSales: salesMetrics._count,
      totalRevenue:
        salesMetrics._sum.totalAmount || 0,
      averageTicket:
        salesMetrics._avg.totalAmount || 0,
      topProducts,
      paymentMethods: paymentMethodsData.map(
        (pm) => ({
          method: pm.paymentMethod,
          count: pm._count,
          amount: pm._sum.totalAmount || 0,
        }),
      ),
      chartData,
    }
  }

  private generateDailyChartPoints(): DailyChartPoint[] {
    const hours: DailyChartPoint[] = []
    for (let i = 0; i < 24; i++) {
      hours.push({
        name: `${i}:00`,
        startHour: i,
        endHour: i + 1,
      })
    }
    return hours
  }

  private generateWeeklyChartPoints(): PeriodChartPoint[] {
    const days = [
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]
    const now = new Date()
    const weekData: PeriodChartPoint[] = []

    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i)
      weekData.push({
        name: days[
          date.getDay() === 0
            ? 6
            : date.getDay() - 1
        ],
        date: date,
      })
    }
    return weekData
  }

  private generateMonthlyChartPoints(): PeriodChartPoint[] {
    const now = new Date()
    const monthData: PeriodChartPoint[] = []

    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i)
      monthData.push({
        name: `${date.getDate()}/${date.getMonth() + 1}`,
        date: date,
      })
    }
    return monthData
  }

  private async generateChartData(
    storeId: string,
    period: string,
    user: AuthPayload,
    chartDataPoints: ChartDataPoint[],
  ) {
    const whereClause: any = {
      storeId,
      status: { not: 'REFUNDED' },
    }

    if (user.role === 'worker') {
      whereClause.workerId = user.id
    }

    const chartData = await Promise.all(
      chartDataPoints.map(async (point) => {
        let periodWhereClause = { ...whereClause }

        if (
          period === 'day' &&
          isDailyChartPoint(point)
        ) {
          // For daily view, group by hours
          const startOfDay = new Date()
          startOfDay.setHours(
            point.startHour,
            0,
            0,
            0,
          )
          const endOfDay = new Date()
          endOfDay.setHours(
            point.endHour,
            0,
            0,
            0,
          )

          periodWhereClause.createdAt = {
            gte: startOfDay,
            lt: endOfDay,
          }
        } else if (isPeriodChartPoint(point)) {
          // For weekly and monthly views, group by days
          const startOfDay = new Date(point.date)
          startOfDay.setHours(0, 0, 0, 0)
          const endOfDay = new Date(point.date)
          endOfDay.setHours(23, 59, 59, 999)

          periodWhereClause.createdAt = {
            gte: startOfDay,
            lte: endOfDay,
          }
        }

        const salesData =
          await this.prisma.sale.aggregate({
            where: periodWhereClause,
            _count: true,
            _sum: { totalAmount: true },
          })

        return {
          name: point.name,
          sales: salesData._sum.totalAmount || 0,
          transactions: salesData._count || 0,
        }
      }),
    )

    return chartData
  }

  async addSaleProduct(
    input: {
      saleId: string
      productId: string
      quantity: number
      modifiers?: any
    },
    user: AuthPayload,
  ) {
    const sale =
      await this.prisma.sale.findUnique({
        where: { id: input.saleId },
        include: { store: true },
      })

    if (!sale) throw new Error('Sale not found')
    if (sale.status !== 'OPEN')
      throw new Error(
        'Can only add products to OPEN sales',
      )

    await this.storeService.verifyStoreAccess(
      sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only modify their own sales',
      )
    }

    const product =
      await this.productService.findOne(
        input.productId,
      )
    if (!product)
      throw new Error('Product not found')
    if (product.storeId !== sale.storeId) {
      throw new Error(
        'Product does not belong to this store',
      )
    }
    if (product.quantity < input.quantity) {
      throw new Error(
        'Insufficient product quantity',
      )
    }

    const saleProduct =
      await this.prisma.saleProduct.create({
        data: {
          sale: { connect: { id: input.saleId } },
          product: {
            connect: { id: input.productId },
          },
          quantity: input.quantity,
          price: product.price,
          modifiers: input.modifiers,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
            },
          },
        },
      })

    // Update sale total
    await this.prisma.sale.update({
      where: { id: input.saleId },
      data: {
        totalAmount: {
          increment:
            product.price * input.quantity,
        },
      },
    })

    // Update product stock
    await this.productService.updateStock(
      input.productId,
      {
        quantity: { decrement: input.quantity },
      },
    )

    const updatedSale = await this.findOne(
      input.saleId,
      user,
    )
    await this.pubSub.publish(
      `sale_updated_${updatedSale.storeId}`,
      {
        saleUpdated: updatedSale,
      },
    )

    return saleProduct
  }

  async updateSaleProduct(
    id: string,
    input: UpdateSaleProductInput,
    user: AuthPayload,
  ) {
    const saleProduct =
      await this.prisma.saleProduct.findUnique({
        where: { id },
        include: {
          sale: { include: { store: true } },
          product: {
            select: {
              price: true,
              quantity: true,
            },
          },
        },
      })

    if (!saleProduct)
      throw new Error('Sale product not found')
    if (saleProduct.sale.status !== 'OPEN') {
      throw new Error(
        'Can only update products in OPEN sales',
      )
    }

    await this.storeService.verifyStoreAccess(
      saleProduct.sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      saleProduct.sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only modify their own sales',
      )
    }

    const updates: any = {}
    let priceChange = 0
    let stockChange = 0

    if (input.quantity !== undefined) {
      const oldQuantity = saleProduct.quantity
      const quantityDiff =
        input.quantity - oldQuantity

      if (
        quantityDiff > 0 &&
        saleProduct.product.quantity <
          quantityDiff
      ) {
        throw new Error(
          'Insufficient product quantity',
        )
      }

      updates.quantity = input.quantity
      priceChange =
        saleProduct.product.price * quantityDiff
      stockChange = -quantityDiff // Negative because we're using more stock
    }

    if (input.modifiers !== undefined) {
      updates.modifiers = input.modifiers
    }

    const updatedSaleProduct =
      await this.prisma.saleProduct.update({
        where: { id },
        data: updates,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              medias: {
                select: { url: true },
              },
            },
          },
        },
      })

    // Update sale total if quantity changed
    if (priceChange !== 0) {
      await this.prisma.sale.update({
        where: { id: saleProduct.saleId },
        data: {
          totalAmount: { increment: priceChange },
        },
      })
    }

    // Update product stock if quantity changed
    if (stockChange !== 0) {
      await this.productService.updateStock(
        saleProduct.productId,
        {
          quantity: { increment: stockChange },
        },
      )
    }

    const updatedSale = await this.findOne(
      saleProduct.saleId,
      user,
    )
    await this.pubSub.publish(
      `sale_updated_${updatedSale.storeId}`,
      {
        saleUpdated: updatedSale,
      },
    )

    return updatedSaleProduct
  }

  async removeSaleProduct(
    id: string,
    user: AuthPayload,
  ) {
    const saleProduct =
      await this.prisma.saleProduct.findUnique({
        where: { id },
        include: {
          sale: { include: { store: true } },
          product: { select: { price: true } },
        },
      })

    if (!saleProduct)
      throw new Error('Sale product not found')
    if (saleProduct.sale.status !== 'OPEN') {
      throw new Error(
        'Can only remove products from OPEN sales',
      )
    }

    await this.storeService.verifyStoreAccess(
      saleProduct.sale.storeId,
      user,
    )
    if (
      user.role === 'worker' &&
      saleProduct.sale.workerId !== user.id
    ) {
      throw new Error(
        'Workers can only modify their own sales',
      )
    }

    // Remove from sale
    await this.prisma.saleProduct.delete({
      where: { id },
    })

    // Update sale total
    const priceReduction =
      saleProduct.product.price *
      saleProduct.quantity
    await this.prisma.sale.update({
      where: { id: saleProduct.saleId },
      data: {
        totalAmount: {
          decrement: priceReduction,
        },
      },
    })

    // Restore product stock
    await this.productService.updateStock(
      saleProduct.productId,
      {
        quantity: {
          increment: saleProduct.quantity,
        },
      },
    )

    const updatedSale = await this.findOne(
      saleProduct.saleId,
      user,
    )
    await this.pubSub.publish(
      `sale_updated_${updatedSale.storeId}`,
      {
        saleUpdated: updatedSale,
      },
    )

    return { id }
  }

  async completeSale(
    id: string,
    paymentMethod: PaymentMethod,
    user: AuthPayload,
  ) {
    return this.close(
      {
        saleId: id,
        paymentMethod,
        status: 'CLOSED',
      },
      user,
    )
  }
}
