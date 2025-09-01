import { Injectable, Inject } from '@nestjs/common';
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
import { PurchaseOrderStatus, TransferOrderStatus } from '../generated/prisma/enums';
import { AuthPayload } from '../auth/entities/auth-payload.entity';
import { PubSub } from 'graphql-subscriptions';
// Service
@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private storeService: StoreService,
    private productService: ProductService,
    private businessService: BusinessService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  async createPurchaseOrder(input: CreatePurchaseOrderInput, user: AuthPayload) {
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

    const purchaseOrder = await this.prisma.purchaseOrder.create({
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

    // Publish subscription event
    await this.pubSub.publish(`purchase_order_created_${storeId}`, { 
      purchaseOrderCreated: purchaseOrder 
    });

    return purchaseOrder;
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

    const updatedPurchaseOrder = await this.prisma.purchaseOrder.update({
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

    // Publish subscription event
    await this.pubSub.publish(`purchase_order_updated_${updatedPurchaseOrder.storeId}`, { 
      purchaseOrderUpdated: updatedPurchaseOrder 
    });

    return updatedPurchaseOrder;
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

    const transferOrder = await this.prisma.transferOrder.create({
      data: {
        fromStore: { connect: { id: fromStoreId } },
        toStore: { connect: { id: toStoreId } },
        status: TransferOrderStatus.PENDING,
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

    // Publish subscription events for both stores
    await this.pubSub.publish(`transfer_order_created_${fromStoreId}-${toStoreId}`, { 
      transferOrderCreated: transferOrder 
    });

    return transferOrder;
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

    const updatedTransferOrder = await this.prisma.transferOrder.update({
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

    // Publish subscription events for both stores
    await this.pubSub.publish(`transfer_order_updated_${updatedTransferOrder.fromStoreId}`, { 
      transferOrderUpdated: updatedTransferOrder 
    });
    await this.pubSub.publish(`transfer_order_updated_${updatedTransferOrder.toStoreId}`, { 
      transferOrderUpdated: updatedTransferOrder 
    });

    return updatedTransferOrder;
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

  // Query methods for frontend
  async getInventory(params: {
    storeId?: string;
    productId?: string;
    lowStockOnly?: boolean;
    page?: number;
    limit?: number;
  }, user: { id: string; role: string }) {
    const { storeId, productId, lowStockOnly, page = 1, limit = 20 } = params;

    if (storeId) {
      await this.storeService.verifyStoreAccess(storeId, user);
    }

    const whereClause: any = {};
    
    if (storeId) whereClause.storeId = storeId;
    if (productId) whereClause.id = productId;
    
    // For low stock, we'll filter after the query since Prisma doesn't support field comparisons easily

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          medias: {
            select: {
              url: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.product.count({ 
        where: whereClause
      })
    ]);

    // console.log("Returned Products from inventory service: ",items);

    // Transform products to inventory format
    let inventoryItems = items.map(product => ({
      id: `${product.storeId}-${product.id}`, // Create a composite ID
      productId: product.id,
      storeId: product.storeId,
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        medias: product.medias || null,
        quantity: product.quantity
      },
      store: product.store
    }));

    // console.log("Returned Products from inventory service after transformation: ",inventoryItems);
    // Filter for low stock if requested
    if (lowStockOnly) {
      inventoryItems = inventoryItems.filter(item => 
        item.quantity <= (item.minQuantity || 0)
      );
    }

    return { 
      items: inventoryItems, 
      total: lowStockOnly ? inventoryItems.length : total,
      page, 
      limit 
    };
  }

  async getPurchaseOrders(params: {
    businessId: string;
    storeId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }, user: { id: string; role: string }) {
    const { businessId, storeId, status, startDate, endDate, page = 1, limit = 20 } = params;

    // Verify business access
    await this.businessService.verifyBusinessAccess(businessId,user);
    
    if (storeId) {
      await this.storeService.verifyStoreAccess(storeId, user);
    }

    const whereClause: any = { businessId };
    
    if (storeId) whereClause.storeId = storeId;
    if (status) whereClause.status = status;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: whereClause,
        include: {
          business: {
            select: {
              id: true,
              name: true
            }
          },
          store: {
            select: {
              id: true,
              name: true
            }
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  medias: {
                    select: {
                      url: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.purchaseOrder.count({ where: whereClause })
    ]);

    // Transform products to match frontend expectations
    const transformedItems = items.map(order => ({
      ...order,
      products: order.products.map(p => ({
        ...p,
        product: {
          ...p.product,
          imageUrl: p.product.medias?.[0]?.url || null
        }
      }))
    }));

    return { items: transformedItems, total, page, limit };
  }

  async getTransferOrders(params: {
    fromStoreId?: string;
    toStoreId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }, user: { id: string; role: string }) {
    const { fromStoreId, toStoreId, status, startDate, endDate, page = 1, limit = 20 } = params;

    const whereClause: any = {};
    
    if (fromStoreId) {
      await this.storeService.verifyStoreAccess(fromStoreId, user);
      whereClause.fromStoreId = fromStoreId;
    }
    if (toStoreId) {
      await this.storeService.verifyStoreAccess(toStoreId, user);
      whereClause.toStoreId = toStoreId;
    }
    if (status) whereClause.status = status;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [items, total] = await Promise.all([
      this.prisma.transferOrder.findMany({
        where: whereClause,
        include: {
          fromStore: {
            select: {
              id: true,
              name: true
            }
          },
          toStore: {
            select: {
              id: true,
              name: true
            }
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  medias: {
                    select: {
                      url: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.transferOrder.count({ where: whereClause })
    ]);

    // Transform products to match frontend expectations
    const transformedItems = items.map(order => ({
      ...order,
      products: order.products.map(p => ({
        ...p,
        product: {
          ...p.product,
          imageUrl: p.product.medias?.[0]?.url || null
        }
      }))
    }));

    return { items: transformedItems, total, page, limit };
  }
}
