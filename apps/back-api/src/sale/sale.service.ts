import { Injectable } from '@nestjs/common';
import { CreateSaleInput } from './dto/create-sale.input';
import { UpdateSaleInput } from './dto/update-sale.input';
import { CloseSaleInput } from './dto/close-sale.input';
import { CreateReturnInput } from './dto/create-return.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountRechargeService } from 'src/account-recharge/account-recharge.service';
import { TokenTransactionService } from 'src/token-transaction/token-transaction.service';
import { Country, RechargeMethod } from 'src/account-recharge/dto/create-account-recharge.input';
import { TokenTransactionType } from 'src/token-transaction/dto/create-token-transaction.input';
import { StoreService } from 'src/store/store.service';
import { WorkerService } from 'src/worker/worker.service';
import { BusinessService } from 'src/business/business.service';
import { ProductService } from 'src/product/product.service';
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
  ) {}

  async create(createSaleInput: CreateSaleInput, user: { id: string; role: string }) {
    const { storeId, workerId, clientId, totalAmount, discount, paymentMethod, saleProducts } = createSaleInput;

    // Validate store and access
    await this.storeService.verifyStoreAccess(storeId, user);

    // Validate worker
    const worker = await this.workerService.findOne(workerId);

    if (!worker) throw new Error("Worker not found")

    if (user.role === 'worker' && worker.id !== user.id) {
      throw new Error('Workers can only create sales for themselves');
    }

    // Validate client (if provided)
    if (clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new Error('Client not found');
      }
    }

    // Validate products and stock
    for (const sp of saleProducts) {
      const product = await this.productService.findOne(sp.productId);

      if (!product) throw new Error("Product not found")

      if (product.storeId !== storeId) {
        throw new Error(`Product ${sp.productId} does not belong to store ${storeId}`);
      }
      if (product.stock < sp.quantity) {
        throw new Error(`Insufficient stock for product ${sp.productId}`);
      }
    }

    // Calculate total
    const calculatedTotal = saleProducts.reduce((sum, sp) => sum + sp.price * sp.quantity, 0);
    const finalTotal = calculatedTotal - (discount || 0);
    if (totalAmount !== finalTotal) {
      throw new Error(`Total amount (${totalAmount}) does not match calculated total (${finalTotal})`);
    }

    // Handle token payment
    if (paymentMethod === 'TOKEN') {
      const balance = await this.accountRechargeService.getBalance(clientId || worker.businessId, clientId ? 'client' : 'business');
      if (balance < totalAmount) {
        throw new Error('Insufficient balance for token payment');
      }
      await this.accountRechargeService.create(
        {
          clientId: clientId || undefined,
          businessId: clientId ? undefined : worker.businessId,
          amount: -totalAmount,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
        },
        clientId || worker.businessId,
        clientId ? 'client' : 'business',
      );
    }

    // Create sale
    const sale = await this.prisma.sale.create({
      data: {
        store: { connect: { id: storeId } },
        worker: { connect: { id: workerId } },
        client: clientId ? { connect: { id: clientId } } : undefined,
        totalAmount,
        discount: discount || 0,
        paymentMethod,
        status: paymentMethod === 'TOKEN' ? 'CLOSED' : 'OPEN',
        saleProducts: {
          create: saleProducts.map((sp) => ({
            product: { connect: { id: sp.productId } },
            quantity: sp.quantity,
            price: sp.price,
            modifiers: sp.modifiers || {},
          })),
        },
      },
      include: {
        store: { select: { id: true, name: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: clientId ? { select: { id: true, username: true, email: true, createdAt: true } } : false,
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, stock: true, createdAt: true } } },
        },
        returns: true,
      },
    });

    // Update stock
    await Promise.all(
      saleProducts.map((sp) =>
        this.productService.updateStock(sp.productId, { stock: { decrement: sp.quantity } }),
      ),
    );

    // Handle commissions for RepostedProduct and profit-sharing for ReOwnedProduct
    for (const sp of sale.saleProducts) {
      const reOwnedProduct = await this.prisma.reOwnedProduct.findFirst({
        where: { newProductId: sp.productId },
        select: { id: true, oldOwnerId: true, oldPrice: true, newPrice: true, quantity: true },
      });
      if (reOwnedProduct) {
        const markup = reOwnedProduct.newPrice - reOwnedProduct.oldPrice;
        if (markup > 0) {
          const profitShare = markup * 0.2 * sp.quantity; // 20% of markup
          await this.tokenTransactionService.create({
            businessId: reOwnedProduct.oldOwnerId,
            reOwnedProductId: reOwnedProduct.id,
            amount: profitShare,
            type: TokenTransactionType.PROFIT_SHARE,
          });
        }
      }

      const repostedProduct = await this.prisma.repostedProduct.findFirst({
        where: { productId: sp.productId },
        select: { id: true, businessId: true },
      });
      if (repostedProduct) {
        const commission = sp.price * 0.003 * sp.quantity; // 0.3% commission
        await this.tokenTransactionService.create({
          businessId: repostedProduct.businessId,
          repostedProductId: repostedProduct.id,
          amount: commission,
          type: TokenTransactionType.REPOST_COMMISSION,
        });
      }
    }

    // Update business sales metrics
    await this.businessService.updateTotalProuctSold(worker.businessId, {
      totalProductsSold: { increment: saleProducts.reduce((sum, sp) => sum + sp.quantity, 0) },
    });

    return sale;
  }

  async update(id: string, updateSaleInput: UpdateSaleInput, user: { id: string; role: string }) {
    const { clientId, totalAmount, discount, paymentMethod, saleProducts } = updateSaleInput;

    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { saleProducts: true, store: true },
    });
    if (!sale) {
      throw new Error('Sale not found');
    }
    await this.storeService.verifyStoreAccess(sale.storeId, user);
    if (user.role === 'worker' && sale.workerId !== user.id) {
      throw new Error('Workers can only update their own sales');
    }
    if (sale.status !== 'OPEN') {
      throw new Error('Can only update OPEN sales');
    }

    // Validate updates
    if (clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new Error('Client not found');
      }
    }
    if (saleProducts) {
      for (const sp of saleProducts) {
        const product = await this.productService.findOne(sp.productId);
        
        if (!product) throw new Error("Product not found")

        if (product.storeId !== sale.storeId) {
          throw new Error(`Product ${sp.productId} does not belong to store ${sale.storeId}`);
        }
      }
    }

    // Update sale
    const updatedSale = await this.prisma.sale.update({
      where: { id },
      data: {
        client: clientId ? { connect: { id: clientId } } : undefined,
        totalAmount,
        discount,
        paymentMethod,
        saleProducts: saleProducts
          ? {
              deleteMany: {}, // Clear existing products
              create: saleProducts.map((sp) => ({
                product: { connect: { id: sp.productId } },
                quantity: sp.quantity,
                price: sp.price,
                modifiers: sp.modifiers || {},
              })),
            }
          : undefined,
      },
      include: {
        store: { select: { id: true, name: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: clientId ? { select: { id: true, username: true, email: true, createdAt: true } } : false,
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, stock: true, createdAt: true } } },
        },
        returns: true,
      },
    });

    // Update stock if saleProducts changed
    if (saleProducts) {
      // Revert old stock
      await Promise.all(
        sale.saleProducts.map((sp) =>
          this.productService.updateStock(sp.productId, { stock: { increment: sp.quantity } }),
        ),
      );
      // Apply new stock
      await Promise.all(
        saleProducts.map((sp) =>
          this.productService.updateStock(sp.productId, { stock: { decrement: sp.quantity } }),
        ),
      );
    }

    return updatedSale;
  }

  async close(closeSaleInput: CloseSaleInput, user: { id: string; role: string }) {
    const { saleId, paymentMethod, status } = closeSaleInput;

    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: { saleProducts: true, store: true },
    });
    if (!sale) {
      throw new Error('Sale not found');
    }
    await this.storeService.verifyStoreAccess(sale.storeId, user);
    if (user.role === 'worker' && sale.workerId !== user.id) {
      throw new Error('Workers can only close their own sales');
    }
    if (sale.status !== 'OPEN') {
      throw new Error('Sale is not OPEN');
    }

    // Handle payment
    if (paymentMethod === 'TOKEN' && sale.paymentMethod !== 'TOKEN') {
      const worker = await this.workerService.findOne(sale.workerId);

      if (!worker) throw new Error("Worker not found")

      const balance = await this.accountRechargeService.getBalance(sale.clientId || worker.businessId, sale.clientId ? 'client' : 'business');
      if (balance < sale.totalAmount) {
        throw new Error('Insufficient balance for token payment');
      }
      await this.accountRechargeService.create(
        {
          clientId: sale.clientId || undefined,
          businessId: sale.clientId ? undefined : worker.businessId,
          amount: -sale.totalAmount,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
        },
        sale.clientId || worker.businessId,
        sale.clientId ? 'client' : 'business',
      );
    }

    return this.prisma.sale.update({
      where: { id: saleId },
      data: { paymentMethod, status: status || 'CLOSED' },
      include: {
        store: { select: { id: true, name: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: sale.clientId ? { select: { id: true, username: true, email: true, createdAt: true } } : false,
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, stock: true, createdAt: true } } },
        },
        returns: true,
      },
    });
  }

  async createReturn(createReturnInput: CreateReturnInput, user: { id: string; role: string }) {
    const { saleId, reason } = createReturnInput;

    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: { saleProducts: true, store: true },
    });
    if (!sale) {
      throw new Error('Sale not found');
    }
    await this.storeService.verifyStoreAccess(sale.storeId, user);
    if (user.role === 'worker' && sale.workerId !== user.id) {
      throw new Error('Workers can only process returns for their own sales');
    }
    if (sale.status === 'REFUNDED') {
      throw new Error('Sale already refunded');
    }

    // Revert stock
    await Promise.all(
      sale.saleProducts.map((sp) =>
        this.productService.updateStock(sp.productId, { stock: { increment: sp.quantity } }),
      ),
    );

    // Refund token payment if applicable
    if (sale.paymentMethod === 'TOKEN') {
      const worker = await this.workerService.findOne(sale.workerId);

      if (!worker) throw new Error("Worker not found")

      await this.accountRechargeService.create(
        {
          clientId: sale.clientId || undefined,
          businessId: sale.clientId ? undefined : worker.businessId,
          amount: sale.totalAmount,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
        },
        sale.clientId || worker.businessId,
        sale.clientId ? 'client' : 'business',
      );
    }

    const returnRecord = await this.prisma.return.create({
      data: {
        sale: { connect: { id: saleId } },
        reason,
        status: 'REFUNDED',
      },
      include: { sale: true },
    });

    await this.prisma.sale.update({
      where: { id: saleId },
      data: { status: 'REFUNDED' },
    });

    return returnRecord;
  }

  async findAll(storeId: string, user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);
    return this.prisma.sale.findMany({
      where: { storeId },
      include: {
        store: { select: { id: true, name: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: { select: { id: true, username: true, email: true, createdAt: true } },
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, stock: true, createdAt: true } } },
        },
        returns: true,
      },
    });
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: { select: { id: true, username: true, email: true, createdAt: true } },
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, stock: true, createdAt: true } } },
        },
        returns: true,
      },
    });
    if (!sale) {
      throw new Error('Sale not found');
    }
    await this.storeService.verifyStoreAccess(sale.storeId, user);
    if (user.role === 'worker' && sale.workerId !== user.id) {
      throw new Error('Workers can only view their own sales');
    }
    return sale;
  }
}

