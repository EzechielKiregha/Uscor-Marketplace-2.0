import { Injectable } from '@nestjs/common';
import { UpdatePurchaseOrderInput } from './dto/update-purchase-order.input';
import { PrismaService } from '../prisma/prisma.service';
import { StoreService } from '../store/store.service';
import { ProductService } from '../product/product.service';
import { BusinessService } from '../business/business.service';
import { CreatePurchaseOrderInput } from './dto/create-purchase-order.input';
import { LowStockAlertInput } from './dto/low-stock-alert.input';
import { CreateTransferOrderInput } from './dto/create-transfer-order.input';
import { UpdateTransferOrderInput } from './dto/update-transfer-order.input';
import { CreateInventoryAdjustmentInput } from './dto/create-inventory.input';
import { PurchaseOrderStatus } from '../generated/prisma/enums';
// Service
@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private storeService: StoreService,
    private productService: ProductService,
    private businessService: BusinessService,
  ) {}

  async createPurchaseOrder(input: CreatePurchaseOrderInput, user: { id: string; role: string }) {
    const { businessId, storeId, supplierId, expectedDelivery, products } = input;

    // Validate business and store
    await this.businessService.findOne(businessId);
    await this.storeService.verifyStoreAccess(storeId, user);

    // Validate products
    for (const p of products) {
      const product = await this.productService.findOne(p.productId);

      if (!product) throw new Error("Product not found")

      if (product.storeId !== storeId) {
        throw new Error(`Product ${p.productId} does not belong to store ${storeId}`);
      }
    }

    return this.prisma.purchaseOrder.create({
      data: {
        business: { connect: { id: businessId } },
        store: { connect: { id: storeId } },
        supplierId,
        status: PurchaseOrderStatus.PENDING,
        expectedDelivery,
        products: {
          create: products.map((p) => ({
            product: { connect: { id: p.productId } },
            quantity: p.quantity,
          })),
        },
      },
      include: {
        business: { select: { id: true, name: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
        products: {
          include: { product: { select: { id: true, title: true, quantity: true, createdAt: true } } },
        },
      },
    });
  }

  async updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput, user: { id: string; role: string }) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { store: true, products: true },
    });
    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }
    await this.storeService.verifyStoreAccess(purchaseOrder.storeId, user);

    // Validate products
    if (input.products) {
      for (const p of input.products) {
        const product = await this.productService.findOne(p.productId);

      if (!product) throw new Error("Product not found")

        if (product.storeId !== purchaseOrder.storeId) {
          throw new Error(`Product ${p.productId} does not belong to store ${purchaseOrder.storeId}`);
        }
      }
    }

    // Update stock if status changes to COMPLETED
    if (input.status === 'COMPLETED' && purchaseOrder.status !== 'COMPLETED') {
      const products = input.products || purchaseOrder.products;
      await Promise.all(
        products.map((p) =>
          this.productService.updateStock(p.productId, { quantity: { increment: p.quantity } }),
        ),
      );
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: input.supplierId,
        expectedDelivery: input.expectedDelivery,
        status: input.status,
        products: input.products
          ? {
              deleteMany: {},
              create: input.products.map((p) => ({
                product: { connect: { id: p.productId } },
                quantity: p.quantity,
              })),
            }
          : undefined,
      },
      include: {
        business: { select: { id: true, name: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
        products: {
          include: { product: { select: { id: true, title: true, quantity: true, createdAt: true } } },
        },
      },
    });
  }

  async createTransferOrder(input: CreateTransferOrderInput, user: { id: string; role: string }) {
    const { fromStoreId, toStoreId, products } = input;

    // Validate stores
    const fromStore = await this.storeService.verifyStoreAccess(fromStoreId, user);
    const toStore = await this.storeService.findOne(toStoreId);
    if (fromStore.businessId !== toStore.businessId) {
      throw new Error('Transfer must occur within the same business');
    }

    // Validate products and stock
    for (const p of products) {
      const product = await this.productService.findOne(p.productId);

      if (!product) throw new Error("Product not found")

      if (product.storeId !== fromStoreId) {
        throw new Error(`Product ${p.productId} does not belong to store ${fromStoreId}`);
      }
      if (product.quantity < p.quantity) {
        throw new Error(`Insufficient stock for product ${p.productId}`);
      }
    }

    return this.prisma.transferOrder.create({
      data: {
        fromStore: { connect: { id: fromStoreId } },
        toStore: { connect: { id: toStoreId } },
        status: PurchaseOrderStatus.PENDING,
        products: {
          create: products.map((p) => ({
            product: { connect: { id: p.productId } },
            quantity: p.quantity,
          })),
        },
      },
      include: {
        fromStore: { select: { id: true, name: true, createdAt: true } },
        toStore: { select: { id: true, name: true, createdAt: true } },
        products: {
          include: { product: { select: { id: true, title: true, quantity: true, createdAt: true } } },
        },
      },
    });
  }

  async updateTransferOrder(id: string, input: UpdateTransferOrderInput, user: { id: string; role: string }) {
    const transferOrder = await this.prisma.transferOrder.findUnique({
      where: { id },
      include: { fromStore: true, toStore: true, products: { include: { product: true } } },
    });
    if (!transferOrder) {
      throw new Error('Transfer order not found');
    }
    await this.storeService.verifyStoreAccess(transferOrder.fromStoreId, user);

    // Validate products
    if (input.products) {
      for (const p of input.products) {
        const product = await this.productService.findOne(p.productId);
        if (!product) {
          throw new Error(`Product ${p.productId} not found`);
        }
        if (product.storeId !== transferOrder.fromStoreId) {
          throw new Error(`Product ${p.productId} does not belong to store ${transferOrder.fromStoreId}`);
        }
        if (product.quantity < p.quantity) {
          throw new Error(`Insufficient stock for product ${p.productId}`);
        }
      }
    }

    // Update stock if status changes to DELIVERED
    if (input.status === 'DELIVERED' && transferOrder.status !== 'DELIVERED') {
      const products = input.products || transferOrder.products;

      await Promise.all(
        products.map(async (p) => {
          // Decrement stock in source store
          const original = await this.productService.updateStock(p.productId, { quantity: { decrement: p.quantity } });

          // Check if a product with the same title and attributes exists in the destination store
          const existingProduct = await this.prisma.product.findFirst({
            where: {
              storeId: transferOrder.toStoreId,
              title: original.title,
              categoryId: original.categoryId,
              price: original.price,
            },
          });

          if (existingProduct) {
            // If product exists, increment its stock
            await this.productService.updateStock(existingProduct.id, { quantity: { increment: p.quantity } });
          } else {
            // Create new product in destination store
            await this.prisma.product.create({
              data: {
                title: original.title,
                price: original.price,
                quantity: p.quantity,
                store: { connect: { id: transferOrder.toStoreId } },
                business: { connect: { id: original.businessId} },
                category: { connect: { id: original.categoryId } },
                description: original.description,
                isPhysical: original.isPhysical,
                variants: original.variants || `{}`,
                createdAt: new Date(),
              },
            });
          }
        }),
      );
    }

    return this.prisma.transferOrder.update({
      where: { id },
      data: {
        status: input.status,
        products: input.products
          ? {
              deleteMany: {},
              create: input.products.map((p) => ({
                product: { connect: { id: p.productId } },
                quantity: p.quantity,
              })),
            }
          : undefined,
      },
      include: {
        fromStore: { select: { id: true, name: true, createdAt: true } },
        toStore: { select: { id: true, name: true, createdAt: true } },
        products: {
          include: { product: { select: { id: true, title: true, quantity: true, createdAt: true } } },
        },
      },
    });
  }

  async createInventoryAdjustment(input: CreateInventoryAdjustmentInput, user: { id: string; role: string }) {
    const { productId, storeId, adjustmentType, quantity, reason } = input;

    // Validate store and product
    await this.storeService.verifyStoreAccess(storeId, user);
    const product = await this.productService.findOne(productId);

    if (!product) throw new Error("Product not found")

    if (product.storeId !== storeId) {
      throw new Error(`Product ${productId} does not belong to store ${storeId}`);
    }
    if (adjustmentType === 'REMOVE' && product.quantity < quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    // Update stock
    const stockUpdate = adjustmentType === 'ADD' ? { increment: quantity } : { decrement: quantity };
    await this.productService.updateStock(productId, { quantity: stockUpdate });

    return this.prisma.inventoryAdjustment.create({
      data: {
        product: { connect: { id: productId } },
        store: { connect: { id: storeId } },
        adjustmentType,
        quantity,
        reason,
      },
      include: {
        product: { select: { id: true, title: true, quantity: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async getLowStockAlerts(input: LowStockAlertInput, user: { id: string; role: string }) {
    const { storeId, threshold } = input;
    await this.storeService.verifyStoreAccess(storeId, user);

    const products = await this.prisma.product.findMany({
      where: { storeId, quantity: { lte: threshold } },
      select: {
        id: true,
        title: true,
        quantity: true,
        createdAt: true,
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });

    return products.map((p) => ({
      productId: p.id,
      product: p,
      storeId,
      store: p.store,
      quantity: p.quantity,
      threshold,
    }));
  }

  async bulkImportProducts(storeId: string, products: { productId: string; quantity: number }[], user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);
    for (const p of products) {
      const product = await this.productService.findOne(p.productId);

      if (!product) throw new Error("Product not found")

      if (product.storeId !== storeId) {
        throw new Error(`Product ${p.productId} does not belong to store ${storeId}`);
      }
    }

    await Promise.all(
      products.map((p) =>
        this.prisma.inventoryAdjustment.create({
          data: {
            product: { connect: { id: p.productId } },
            store: { connect: { id: storeId } },
            adjustmentType: 'ADD',
            quantity: p.quantity,
            reason: 'Bulk import',
          },
        }),
      ),
    );

    await Promise.all(
      products.map((p) =>
        this.productService.updateStock(p.productId, { quantity: { increment: p.quantity } }),
      ),
    );

    return { success: true, count: products.length };
  }

  async bulkExportProducts(storeId: string, user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);
    const products = await this.prisma.product.findMany({
      where: { storeId },
      select: { id: true, title: true, quantity: true },
    });
    return products.map((p) => ({ productId: p.id, title: p.title, quantity: p.quantity }));
  }
}
