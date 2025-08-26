import { Inject, Injectable } from '@nestjs/common';
import { CreateSaleInput } from './dto/create-sale.input';
import { UpdateSaleInput } from './dto/update-sale.input';
import { CloseSaleInput } from './dto/close-sale.input';
import { CreateReturnInput } from './dto/create-return.input';
import { PrismaService } from '../prisma/prisma.service';
import { AccountRechargeService } from '../account-recharge/account-recharge.service';
import { TokenTransactionService } from '../token-transaction/token-transaction.service';
import { Country, RechargeMethod } from '../account-recharge/dto/create-account-recharge.input';
import { TokenTransactionType } from '../token-transaction/dto/create-token-transaction.input';
import { StoreService } from '../store/store.service';
import { WorkerService } from '../worker/worker.service';
import { BusinessService } from '../business/business.service';
import { ProductService } from '../product/product.service';
import { LoyaltyService } from '../loyalty-program/loyalty-program.service';
import { GenerateReceiptInput } from './dto/receipt.input';
import { promisify } from 'util';
import { exec } from 'child_process';
import { createWriteStream, mkdir } from 'fs';
import { subDays } from 'date-fns';
import { PaymentMethod } from '../payment-transaction/dto/create-payment-transaction.input';
import { PubSub } from 'graphql-subscriptions';
const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
// import PDFDocument from 'pdfkit';
const PDFDocument = require('pdfkit');

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
    private loyaltyService: LoyaltyService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async create(createSaleInput: CreateSaleInput, user: { id: string; role: string }) {
    const { storeId, workerId, clientId, totalAmount, discount, paymentMethod, saleProducts } = createSaleInput;

    // Validate store and access
    await this.storeService.verifyStoreAccess(storeId, user);

    // Validate worker
    const worker = await this.workerService.findOne(workerId);
    if (!worker) throw new Error("Worker not found");
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

    // Validate products and quantity
    for (const sp of saleProducts) {
      const product = await this.productService.findOne(sp.productId);
      if (!product) throw new Error("Product not found");
      if (product.storeId !== storeId) {
        throw new Error(`Product ${sp.productId} does not belong to store ${storeId}`);
      }
      if (product.quantity < sp.quantity) {
        throw new Error(`Insufficient quantity for product ${sp.productId}`);
      }
    }

    

    // Calculate total
    let calculatedTotal = 0
    let sales = new Array
    for (const sp of saleProducts) {
    const p = await this.prisma.product.findUnique({
      where : { id: sp.productId },
      select: {
        id: true,
        quantity: true,
        price: true,
        createdAt: true,
      }
    })
    if (!p) throw new Error("This product does not exist this store")
    calculatedTotal = calculatedTotal + (p.price * sp.quantity)
    
    sales.push({
      ...sp,
      uniquePrice : p.price
    })
    
    }

    const finalTotal = calculatedTotal - (discount || 0);
    if (totalAmount !== finalTotal) {
      // throw new Error(`Total amount (${totalAmount}) does not match calculated total (${finalTotal})`);
    }

    // Handle token payment
    if (paymentMethod === 'TOKEN') {
      const balance = await this.accountRechargeService.getBalance(clientId || worker.businessId, clientId ? 'client' : 'business');
      if (balance < finalTotal) {
        throw new Error('Insufficient balance for token payment');
      }
      await this.accountRechargeService.create(
        {
          clientId: clientId || undefined,
          businessId: clientId ? undefined : worker.businessId,
          amount: -finalTotal,
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
        totalAmount: finalTotal,
        discount: discount || 0,
        paymentMethod,
        status: paymentMethod === 'TOKEN' ? 'CLOSED' : 'OPEN',
        saleProducts: {
          create: sales.map((sp) => ({
            product: { connect: { id: sp.productId } },
            quantity: sp.quantity,
            price: sp.uniquePrice,
            modifiers: sp.modifiers ,
          })),
        },
      },
      include: {
        store: { select: { id: true, name: true, businessId: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: clientId ? { select: { id: true, username: true, email: true, createdAt: true } } : false,
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, quantity: true, createdAt: true } } },
        },
        returns: true,
      },
    });

    // Update quantity
    await Promise.all(
      saleProducts.map((sp) =>
        this.productService.updateStock(sp.productId, { quantity: { decrement: sp.quantity } }),
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
        const commission = sp.price * 0.002 * sp.quantity; // 0.02% commission
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

    // Award loyalty points if sale is CLOSED
    if (sale.status === 'CLOSED' && sale.clientId) {
      const loyaltyProgram = await this.prisma.loyaltyProgram.findFirst({
        where: { businessId: sale.store.businessId },
      });
      if (loyaltyProgram) {
        const points = sale.totalAmount * loyaltyProgram.pointsPerPurchase;
        await this.loyaltyService.createPointsTransaction(
          {
            clientId: sale.clientId,
            loyaltyProgramId: loyaltyProgram.id,
            points,
          },
          user,
        );
      }
    }

    await this.pubSub.publish(`sale_created_${sale.storeId}`, { 
      saleCreated: sale 
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
        if (!product) throw new Error("Product not found");
        if (product.storeId !== sale.storeId) {
          throw new Error(`Product ${sp.productId} does not belong to store ${sale.storeId}`);
        }
      }
    }

    // Calculate total if updated
    let finalTotal = sale.totalAmount;
    let calculatedTotal = 0
    let sales = new Array
    if (saleProducts || discount !== undefined) {

    if (saleProducts) {
      for (const sp of saleProducts) {
      const p = await this.prisma.product.findUnique({
        where : { id: sp.productId },
        select: {
          id: true,
          quantity: true,
          price: true,
          createdAt: true,
        }
      })
      if (!p) throw new Error("This product does not exist this store")
      calculatedTotal = calculatedTotal + (p.price * sp.quantity)
      
      sales.push({
        ...sp,
        uniquePrice : p.price
      })
      
      }
    } else {
      calculatedTotal = sale.totalAmount
    }
    //  const calculatedTotal = saleProducts
    //    ? saleProducts.reduce((sum, sp) => sum + sp.price * sp.quantity, 0)
    //    : sale.totalAmount;

      finalTotal = calculatedTotal - (discount !== undefined ? discount : sale.discount);
    }
    if (totalAmount && totalAmount !== finalTotal) {
      // throw new Error(`Total amount (${totalAmount}) does not match calculated total (${finalTotal})`);
    }

    // Update sale
    const updatedSale = await this.prisma.sale.update({
      where: { id },
      data: {
        client: clientId ? { connect: { id: clientId } } : undefined,
        totalAmount: finalTotal,
        discount: discount !== undefined ? discount : sale.discount,
        paymentMethod,
        saleProducts: sales
          ? {
              deleteMany: {},
              create: sales.map((sp) => ({
                product: { connect: { id: sp.productId } },
                quantity: sp.quantity,
                price: sp.price ? sp.price : sp.uniquePrice,
                modifiers: sp.modifiers,
              })),
            }
          : undefined,
      },
      include: {
        store: { select: { id: true, name: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: clientId ? { select: { id: true, username: true, email: true, createdAt: true } } : false,
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, quantity: true, createdAt: true } } },
        },
        returns: true,
      },
    });

    // Update quantity if saleProducts changed
    if (saleProducts) {
      await Promise.all(
        sale.saleProducts.map((sp) =>
          this.productService.updateStock(sp.productId, { quantity: { increment: sp.quantity } }),
        ),
      );
      await Promise.all(
        saleProducts.map((sp) =>
          this.productService.updateStock(sp.productId, { quantity: { decrement: sp.quantity } }),
        ),
      );
    }

    await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, { 
      saleUpdated: updatedSale 
    });

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
      if (!worker) throw new Error("Worker not found");
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

    // Award loyalty points if closing to CLOSED
    if ((status || 'CLOSED') === 'CLOSED' && sale.clientId) {
      const loyaltyProgram = await this.prisma.loyaltyProgram.findFirst({
        where: { businessId: sale.store.businessId },
      });
      if (loyaltyProgram) {
        const points = sale.totalAmount * loyaltyProgram.pointsPerPurchase;
        await this.loyaltyService.createPointsTransaction(
          {
            clientId: sale.clientId,
            loyaltyProgramId: loyaltyProgram.id,
            points,
          },
          user,
        );
      }
    }

    const closedSale = await this.prisma.sale.update({
      where: { id: saleId },
      data: { paymentMethod: paymentMethod || sale.paymentMethod, status: status || 'CLOSED' },
      include: {
        store: { select: { id: true, name: true, address: true, createdAt: true } },
        worker: { select: { id: true, fullName: true, email: true, createdAt: true } },
        client: sale.clientId ? { select: { id: true, username: true, email: true, createdAt: true } } : false,
        saleProducts: {
          include: { product: { select: { id: true, title: true, price: true, quantity: true, createdAt: true } } },
        },
        returns: true,
      },
    });

    await this.pubSub.publish(`sale_updated_${sale.storeId}`, { 
      saleUpdated: sale 
    });

    return closedSale
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

    // Revert quantity
    await Promise.all(
      sale.saleProducts.map((sp) =>
        this.productService.updateStock(sp.productId, { quantity: { increment: sp.quantity } }),
      ),
    );

    // Refund token payment if applicable
    if (sale.paymentMethod === 'TOKEN') {
      const worker = await this.workerService.findOne(sale.workerId);
      if (!worker) throw new Error("Worker not found");
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
          include: { product: { select: { id: true, title: true, price: true, quantity: true, createdAt: true } } },
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
          include: { product: { select: { id: true, title: true, price: true, quantity: true, createdAt: true } } },
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

  async generateReceipt(input: GenerateReceiptInput, user: { id: string; role: string }) {
    const { saleId, email } = input;

    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        store: true,
        worker: true,
        client: true,
        saleProducts: { include: { product: true } },
      },
    });
    if (!sale) throw new Error('Sale not found');
    await this.storeService.verifyStoreAccess(sale.storeId, user);
    if (user.role === 'worker' && sale.workerId !== user.id) {
      throw new Error('Workers can only generate receipts for their own sales');
    }

    let pointsEarned = 0;
    if (sale.clientId) {
      const loyaltyProgram = await this.prisma.loyaltyProgram.findFirst({
        where: { businessId: sale.store.businessId },
      });
      if (loyaltyProgram) {
        pointsEarned = sale.totalAmount * loyaltyProgram.pointsPerPurchase;
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
`;

    const fileName = `receipt_${sale.id}.tex`;
    const outputDir = './receipts';
    // await execAsync(`mkdir -p ${outputDir}`);
    await mkdirAsync(outputDir, { recursive: true });

    const stream = createWriteStream(`${outputDir}/${fileName}`);

    await new Promise((resolve, reject) => {
      stream.write(latexContent)
      stream.on('finish', () => resolve);
      stream.on('error', reject);
    });
    // await new Promise((resolve, reject) => {
    //   createWriteStream(`${outputDir}/${fileName}`)
    //     .write(latexContent)
    //     .on('finish', () => resolve)
    //     .on('error', reject);
    // });
    await execAsync(`latexmk -pdf -output-directory=${outputDir} ${outputDir}/${fileName}`);

    let emailSent = false;
    if (email) {
      console.log(`Simulated sending receipt to ${email}`);
      emailSent = true;
    }

    return { filePath: `${outputDir}/receipt_${sale.id}.pdf`, emailSent };
  }

  async generateReceiptWithPDFKit(input: GenerateReceiptInput, user: { id: string; role: string }) {
    const { saleId, email } = input;
  
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        store: true,
        worker: true,
        client: true,
        saleProducts: { include: { product: true } },
      },
    });
    if (!sale) throw new Error('Sale not found');
    await this.storeService.verifyStoreAccess(sale.storeId, user);
    if (user.role === 'worker' && sale.workerId !== user.id) {
      throw new Error('Workers can only generate receipts for their own sales');
    }
  
    let pointsEarned = 0;
    if (sale.clientId) {
      const loyaltyProgram = await this.prisma.loyaltyProgram.findFirst({
        where: { businessId: sale.store.businessId },
      });
      if (loyaltyProgram) {
        pointsEarned = sale.totalAmount * loyaltyProgram.pointsPerPurchase;
      }
    }
  
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fileName = `receipt_pdfkit_${sale.id}.pdf`;
    const outputDir = './receipts';
    await mkdirAsync(outputDir, { recursive: true });
    const stream = createWriteStream(`${outputDir}/${fileName}`);
  
    doc.pipe(stream);
  
    // Header
    doc.font('Helvetica-Bold').fontSize(16).text(`Receipt - ${sale.store.name}`, { align: 'center' });
    doc.font('Helvetica').fontSize(10);
    doc.text(sale.store.address || 'No address provided', { align: 'center' });
    doc.text(`Sale ID: ${sale.id}`, { align: 'center' });
    doc.text(`Date: ${sale.createdAt.toISOString().split('T')[0]}`, { align: 'center' });
    doc.text(`Worker: ${sale.worker.fullName}`, { align: 'center' });
    if (sale.client) {
      doc.text(`Customer: ${sale.client.username}`, { align: 'center' });
    }
    doc.moveDown(2);
  
    // Items Table
    doc.font('Helvetica-Bold').fontSize(12).text('Items', { align: 'left' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);
    doc.text('Item', 50, doc.y, { continued: true });
    doc.text('Modifiers', 200, doc.y, { continued: true });
    doc.text('Qty', 350, doc.y, { continued: true });
    doc.text('Price', 450, doc.y, { align: 'right' });
    doc.moveDown(0.5);
    doc.text('-'.repeat(100), { align: 'left' });
  
    sale.saleProducts.forEach((sp) => {
      doc.text(sp.product.title, 50, doc.y, { continued: true });
      doc.text(sp.modifiers ? JSON.stringify(sp.modifiers).replace(/"/g, '') : '-', 200, doc.y, { continued: true });
      doc.text(sp.quantity.toString(), 350, doc.y, { continued: true });
      doc.text(`$${sp.price.toFixed(2)}`, 450, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    });
  
    doc.text('-'.repeat(100), { align: 'left' });
    doc.moveDown(1);
  
    // Totals
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Subtotal: $${sale.totalAmount.toFixed(2)}`, { align: 'right' });
    doc.text(`Discount: $${sale.discount.toFixed(2)}`, { align: 'right' });
    doc.text(`Total: $${(sale.totalAmount - sale.discount).toFixed(2)}`, { align: 'right' });
    doc.text(`Payment Method: ${sale.paymentMethod}`, { align: 'right' });
    if (pointsEarned > 0) {
      doc.text(`Points Earned: ${pointsEarned.toFixed(2)}`, { align: 'right' });
    }
  
    doc.end();
  
    await new Promise((resolve, reject) => {
      stream.on('finish', () => resolve);
      stream.on('error', reject);
    });
  
    let emailSent = false;
    if (email) {
      console.log(`Simulated sending receipt to ${email}`);
      emailSent = true;
    }
  
    return { filePath: `${outputDir}/${fileName}`, emailSent };
  }

  // Add these methods to your existing SaleService class

  async findActiveSales(storeId: string, user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);
    
    const whereClause: any = { 
      storeId, 
      status: 'OPEN' 
    };
    
    if (user.role === 'worker') {
      whereClause.workerId = user.id;
    }

    return this.prisma.sale.findMany({
      where: whereClause,
      include: {
        store: { select: { id: true, name: true, address: true } },
        worker: { select: { id: true, fullName: true, role: true } },
        client: { select: { id: true, fullName: true, email: true } },
        saleProducts: {
          include: { 
            product: { 
              select: { id: true, title: true, price: true } 
            } 
          }
        },
        returns: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findSalesWithPagination(params: {
    storeId?: string;
    workerId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    page?: number;
    limit?: number;
  }, user: { id: string; role: string }) {
    
    const { storeId, workerId, startDate, endDate, status, page = 1, limit = 20 } = params;
    
    if (storeId) {
      await this.storeService.verifyStoreAccess(storeId, user);
    }

    const whereClause: any = {};
    
    if (storeId) whereClause.storeId = storeId;
    if (workerId) whereClause.workerId = workerId;
    if (status) whereClause.status = status;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }
    
    if (user.role === 'worker' && !workerId) {
      whereClause.workerId = user.id;
    }

    const [items, total] = await Promise.all([
      this.prisma.sale.findMany({
        where: whereClause,
        include: {
          store: { select: { id: true, name: true, address: true } },
          worker: { select: { id: true, fullName: true, role: true } },
          client: { select: { id: true, fullName: true, email: true } },
          saleProducts: {
            include: { 
              product: { 
                select: { id: true, title: true, price: true } 
              } 
            }
          },
          returns: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.sale.count({ where: whereClause })
    ]);

    return { items, total, page, limit };
  }

  async getSalesDashboard(storeId: string, period: string = 'day', user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = subDays(now, 1);
    }

    const whereClause: any = {
      storeId,
      createdAt: { gte: startDate },
      status: { not: 'REFUNDED' }
    };
    
    if (user.role === 'worker') {
      whereClause.workerId = user.id;
    }

    const [salesMetrics, topProductsData, paymentMethodsData] = await Promise.all([
      this.prisma.sale.aggregate({
        where: whereClause,
        _count: true,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true }
      }),
      
      this.prisma.saleProduct.groupBy({
        by: ['productId'],
        where: {
          sale: whereClause
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      
      this.prisma.sale.groupBy({
        by: ['paymentMethod'],
        where: whereClause,
        _count: true,
        _sum: { totalAmount: true }
      })
    ]);

    // Get product details for top products
    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, title: true }
        });
        return {
          id: product?.id,
          title: product?.title,
          quantitySold: item._sum.quantity || 0
        };
      })
    );

    return {
      totalSales: salesMetrics._count,
      totalRevenue: salesMetrics._sum.totalAmount || 0,
      averageTicket: salesMetrics._avg.totalAmount || 0,
      topProducts,
      paymentMethods: paymentMethodsData.map(pm => ({
        method: pm.paymentMethod,
        count: pm._count,
        amount: pm._sum.totalAmount || 0
      }))
    };
  }

  async addSaleProduct(input: {
    saleId: string;
    productId: string;
    quantity: number;
    modifiers?: any;
  }, user: { id: string; role: string }) {
    
    const sale = await this.prisma.sale.findUnique({
      where: { id: input.saleId },
      include: { store: true }
    });
    
    if (!sale) throw new Error('Sale not found');
    if (sale.status !== 'OPEN') throw new Error('Can only add products to OPEN sales');
    
    await this.storeService.verifyStoreAccess(sale.storeId, user);
    if (user.role === 'worker' && sale.workerId !== user.id) {
      throw new Error('Workers can only modify their own sales');
    }

    const product = await this.productService.findOne(input.productId);
    if (!product) throw new Error('Product not found');
    if (product.storeId !== sale.storeId) {
      throw new Error('Product does not belong to this store');
    }
    if (product.quantity < input.quantity) {
      throw new Error('Insufficient product quantity');
    }

    const saleProduct = await this.prisma.saleProduct.create({
      data: {
        sale: { connect: { id: input.saleId } },
        product: { connect: { id: input.productId } },
        quantity: input.quantity,
        price: product.price,
        modifiers: input.modifiers
      },
      include: {
        product: { select: { id: true, title: true, description: true, price: true } }
      }
    });

    // Update sale total
    await this.prisma.sale.update({
      where: { id: input.saleId },
      data: {
        totalAmount: { increment: product.price * input.quantity }
      }
    });

    // Update product stock
    await this.productService.updateStock(input.productId, {
      quantity: { decrement: input.quantity }
    });

    const updatedSale = await this.findOne(input.saleId, user);
    await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, { 
      saleUpdated: updatedSale 
    });

    return saleProduct;
  }

  async updateSaleProduct(id: string, input: {
    quantity?: number;
    modifiers?: any;
  }, user: { id: string; role: string }) {
    
    const saleProduct = await this.prisma.saleProduct.findUnique({
      where: { id },
      include: { 
        sale: { include: { store: true } },
        product: { select: { price: true, quantity: true } }
      }
    });
    
    if (!saleProduct) throw new Error('Sale product not found');
    if (saleProduct.sale.status !== 'OPEN') {
      throw new Error('Can only update products in OPEN sales');
    }
    
    await this.storeService.verifyStoreAccess(saleProduct.sale.storeId, user);
    if (user.role === 'worker' && saleProduct.sale.workerId !== user.id) {
      throw new Error('Workers can only modify their own sales');
    }

    const updates: any = {};
    let priceChange = 0;
    let stockChange = 0;

    if (input.quantity !== undefined) {
      const oldQuantity = saleProduct.quantity;
      const quantityDiff = input.quantity - oldQuantity;
      
      if (quantityDiff > 0 && saleProduct.product.quantity < quantityDiff) {
        throw new Error('Insufficient product quantity');
      }
      
      updates.quantity = input.quantity;
      priceChange = saleProduct.product.price * quantityDiff;
      stockChange = -quantityDiff; // Negative because we're using more stock
    }
    
    if (input.modifiers !== undefined) {
      updates.modifiers = input.modifiers;
    }

    const updatedSaleProduct = await this.prisma.saleProduct.update({
      where: { id },
      data: updates,
      include: {
        product: { select: { id: true, title: true, description: true, price: true } }
      }
    });

    // Update sale total if quantity changed
    if (priceChange !== 0) {
      await this.prisma.sale.update({
        where: { id: saleProduct.saleId },
        data: { totalAmount: { increment: priceChange } }
      });
    }

    // Update product stock if quantity changed
    if (stockChange !== 0) {
      await this.productService.updateStock(saleProduct.productId, {
        quantity: { increment: stockChange }
      });
    }

    const updatedSale = await this.findOne(saleProduct.saleId, user);
    await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, { 
      saleUpdated: updatedSale 
    });

    return updatedSaleProduct;
  }

  async removeSaleProduct(id: string, user: { id: string; role: string }) {
    const saleProduct = await this.prisma.saleProduct.findUnique({
      where: { id },
      include: { 
        sale: { include: { store: true } },
        product: { select: { price: true } }
      }
    });
    
    if (!saleProduct) throw new Error('Sale product not found');
    if (saleProduct.sale.status !== 'OPEN') {
      throw new Error('Can only remove products from OPEN sales');
    }
    
    await this.storeService.verifyStoreAccess(saleProduct.sale.storeId, user);
    if (user.role === 'worker' && saleProduct.sale.workerId !== user.id) {
      throw new Error('Workers can only modify their own sales');
    }

    // Remove from sale
    await this.prisma.saleProduct.delete({ where: { id } });

    // Update sale total
    const priceReduction = saleProduct.product.price * saleProduct.quantity;
    await this.prisma.sale.update({
      where: { id: saleProduct.saleId },
      data: { totalAmount: { decrement: priceReduction } }
    });

    // Restore product stock
    await this.productService.updateStock(saleProduct.productId, {
      quantity: { increment: saleProduct.quantity }
    });

    const updatedSale = await this.findOne(saleProduct.saleId, user);
    await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, { 
      saleUpdated: updatedSale 
    });

    return { id };
  }

  async completeSale(id: string, paymentMethod: PaymentMethod, user: { id: string; role: string }) {
    return this.close({ saleId: id, paymentMethod, status: 'CLOSED' }, user);
  }

  
}

