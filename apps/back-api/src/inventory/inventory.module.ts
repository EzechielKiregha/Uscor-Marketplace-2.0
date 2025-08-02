import { Module, Injectable } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context, Int, Float } from '@nestjs/graphql';
import { ObjectType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsString, IsNumber, Min, IsEnum, IsOptional, IsArray, IsDate } from 'class-validator';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StoreService } from '../store/store.service';
import { ProductService } from '../product/product.service';
import { BusinessService } from '../business/business.service';
import { WorkerService } from '../worker/worker.service';
import { PurchaseOrderStatus, TransferOrderStatus, AdjustmentType } from '../generated/prisma/enums';

// Enums
registerEnumType(PurchaseOrderStatus, { name: 'PurchaseOrderStatus' });
registerEnumType(TransferOrderStatus, { name: 'TransferOrderStatus' });
registerEnumType(AdjustmentType, { name: 'AdjustmentType' });

// DTOs
@InputType()
export class CreatePurchaseOrderInput {
  @Field()
  @IsString()
  businessId: string;

  @Field()
  @IsString()
  storeId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expectedDelivery?: Date;

  @Field(() => [PurchaseOrderProductInput])
  @IsArray()
  products: PurchaseOrderProductInput[];
}

@InputType()
export class PurchaseOrderProductInput {
  @Field()
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}

@InputType()
export class UpdatePurchaseOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expectedDelivery?: Date;

  @Field(() => PurchaseOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @Field(() => [PurchaseOrderProductInput], { nullable: true })
  @IsOptional()
  @IsArray()
  products?: PurchaseOrderProductInput[];
}

@InputType()
export class CreateTransferOrderInput {
  @Field()
  @IsString()
  fromStoreId: string;

  @Field()
  @IsString()
  toStoreId: string;

  @Field(() => [TransferOrderProductInput])
  @IsArray()
  products: TransferOrderProductInput[];
}

@InputType()
export class TransferOrderProductInput {
  @Field()
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}

@InputType()
export class UpdateTransferOrderInput {
  @Field(() => TransferOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TransferOrderStatus)
  status?: TransferOrderStatus;

  @Field(() => [TransferOrderProductInput], { nullable: true })
  @IsOptional()
  @IsArray()
  products?: TransferOrderProductInput[];
}

@InputType()
export class CreateInventoryAdjustmentInput {
  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsString()
  storeId: string;

  @Field(() => AdjustmentType)
  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@InputType()
export class LowStockAlertInput {
  @Field()
  @IsString()
  storeId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  threshold: number;
}

// Entity Definitions
@ObjectType()
export class StoreEntity {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class BusinessEntity {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ProductEntity {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  stock: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PurchaseOrderProductEntity {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => ProductEntity)
  product: ProductEntity;
}

@ObjectType()
export class PurchaseOrderEntity {
  @Field()
  id: string;

  @Field()
  businessId: string;

  @Field(() => BusinessEntity)
  business: BusinessEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field({ nullable: true })
  supplierId?: string;

  @Field(() => PurchaseOrderStatus)
  status: PurchaseOrderStatus;

  @Field({ nullable: true })
  expectedDelivery?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [PurchaseOrderProductEntity])
  products: PurchaseOrderProductEntity[];
}

@ObjectType()
export class TransferOrderProductEntity {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => ProductEntity)
  product: ProductEntity;
}

@ObjectType()
export class TransferOrderEntity {
  @Field()
  id: string;

  @Field()
  fromStoreId: string;

  @Field(() => StoreEntity)
  fromStore: StoreEntity;

  @Field()
  toStoreId: string;

  @Field(() => StoreEntity)
  toStore: StoreEntity;

  @Field(() => TransferOrderStatus)
  status: TransferOrderStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [TransferOrderProductEntity])
  products: TransferOrderProductEntity[];
}

@ObjectType()
export class InventoryAdjustmentEntity {
  @Field()
  id: string;

  @Field()
  productId: string;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field(() => AdjustmentType)
  adjustmentType: AdjustmentType;

  @Field(() => Int)
  quantity: number;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class LowStockAlertEntity {
  @Field()
  productId: string;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field(() => Int)
  stock: number;

  @Field(() => Int)
  threshold: number;
}

// Service
@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private storeService: StoreService,
    private productService: ProductService,
    private businessService: BusinessService,
    private workerService: WorkerService,
  ) {}

  async createPurchaseOrder(input: CreatePurchaseOrderInput, user: { id: string; role: string }) {
    const { businessId, storeId, supplierId, expectedDelivery, products } = input;

    // Validate business and store
    await this.businessService.findOne(businessId);
    await this.storeService.verifyStoreAccess(storeId, user);

    // Validate products
    for (const p of products) {
      const product = await this.productService.findOne(p.productId);
      if (product.storeId !== storeId) {
        throw new Error(`Product ${p.productId} does not belong to store ${storeId}`);
      }
    }

    return this.prisma.purchaseOrder.create({
      data: {
        business: { connect: { id: businessId } },
        store: { connect: { id: storeId } },
        supplierId,
        status: 'PENDING',
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
          include: { product: { select: { id: true, title: true, stock: true, createdAt: true } } },
        },
      },
    });
  }

  async updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput, user: { id: string; role: string }) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }
    await this.storeService.verifyStoreAccess(purchaseOrder.storeId, user);

    // Validate products
    if (input.products) {
      for (const p of input.products) {
        const product = await this.productService.findOne(p.productId);
        if (product.storeId !== purchaseOrder.storeId) {
          throw new Error(`Product ${p.productId} does not belong to store ${purchaseOrder.storeId}`);
        }
      }
    }

    // Update stock if status changes to COMPLETED
    if (input.status === 'COMPLETED' && purchaseOrder.status !== 'COMPLETED') {
      const products = input.products || (await this.prisma.purchaseOrderProduct.findMany({ where: { purchaseOrderId: id } }));
      await Promise.all(
        products.map((p) =>
          this.productService.updateStock(p.productId, { stock: { increment: p.quantity } }),
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
          include: { product: { select: { id: true, title: true, stock: true, createdAt: true } } },
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
      if (product.storeId !== fromStoreId) {
        throw new Error(`Product ${p.productId} does not belong to store ${fromStoreId}`);
      }
      if (product.stock < p.quantity) {
        throw new Error(`Insufficient stock for product ${p.productId}`);
      }
    }

    return this.prisma.transferOrder.create({
      data: {
        fromStore: { connect: { id: fromStoreId } },
        toStore: { connect: { id: toStoreId } },
        status: 'PENDING',
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
          include: { product: { select: { id: true, title: true, stock: true, createdAt: true } } },
        },
      },
    });
  }

  async updateTransferOrder(id: string, input: UpdateTransferOrderInput, user: { id: string; role: string }) {
    const transferOrder = await this.prisma.transferOrder.findUnique({
      where: { id },
      include: { fromStore: true, products: true },
    });
    if (!transferOrder) {
      throw new Error('Transfer order not found');
    }
    await this.storeService.verifyStoreAccess(transferOrder.fromStoreId, user);

    // Validate products
    if (input.products) {
      for (const p of input.products) {
        const product = await this.productService.findOne(p.productId);
        if (product.storeId !== transferOrder.fromStoreId) {
          throw new Error(`Product ${p.productId} does not belong to store ${transferOrder.fromStoreId}`);
        }
      }
    }

    // Update stock if status changes to DELIVERED
    if (input.status === 'DELIVERED' && transferOrder.status !== 'DELIVERED') {
      const products = input.products || transferOrder.products;
      await Promise.all(
        products.map((p) =>
          this.productService.updateStock(p.productId, { stock: { decrement: p.quantity } }),
        ),
      );
      await Promise.all(
        products.map((p) =>
          this.prisma.product.update({
            where: { id: p.productId },
            data: { store: { connect: { id: transferOrder.toStoreId } }, stock: { increment: p.quantity } },
          }),
        ),
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
          include: { product: { select: { id: true, title: true, stock: true, createdAt: true } } },
        },
      },
    });
  }

  async createInventoryAdjustment(input: CreateInventoryAdjustmentInput, user: { id: string; role: string }) {
    const { productId, storeId, adjustmentType, quantity, reason } = input;

    // Validate store and product
    await this.storeService.verifyStoreAccess(storeId, user);
    const product = await this.productService.findOne(productId);
    if (product.storeId !== storeId) {
      throw new Error(`Product ${productId} does not belong to store ${storeId}`);
    }
    if (adjustmentType === 'REMOVE' && product.stock < quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    // Update stock
    const stockUpdate = adjustmentType === 'ADD' ? { increment: quantity } : { decrement: quantity };
    await this.productService.updateStock(productId, { stock: stockUpdate });

    return this.prisma.inventoryAdjustment.create({
      data: {
        product: { connect: { id: productId } },
        store: { connect: { id: storeId } },
        adjustmentType,
        quantity,
        reason,
      },
      include: {
        product: { select: { id: true, title: true, stock: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async getLowStockAlerts(input: LowStockAlertInput, user: { id: string; role: string }) {
    const { storeId, threshold } = input;
    await this.storeService.verifyStoreAccess(storeId, user);

    const products = await this.prisma.product.findMany({
      where: { storeId, stock: { lte: threshold } },
      select: {
        id: true,
        title: true,
        stock: true,
        createdAt: true,
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });

    return products.map((p) => ({
      productId: p.id,
      product: p,
      storeId,
      store: p.store,
      stock: p.stock,
      threshold,
    }));
  }

  async bulkImportProducts(storeId: string, products: { productId: string; quantity: number }[], user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);
    for (const p of products) {
      const product = await this.productService.findOne(p.productId);
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
        this.productService.updateStock(p.productId, { stock: { increment: p.quantity } }),
      ),
    );

    return { success: true, count: products.length };
  }

  async bulkExportProducts(storeId: string, user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);
    const products = await this.prisma.product.findMany({
      where: { storeId },
      select: { id: true, title: true, stock: true },
    });
    return products.map((p) => ({ productId: p.id, title: p.title, quantity: p.stock }));
  }
}

// Resolver
@Resolver(() => PurchaseOrderEntity)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => PurchaseOrderEntity, { description: 'Creates a new purchase order.' })
  async createPurchaseOrder(
    @Args('createPurchaseOrderInput') input: CreatePurchaseOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.createPurchaseOrder(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => PurchaseOrderEntity, { description: 'Updates a purchase order.' })
  async updatePurchaseOrder(
    @Args('id', { type: () => String }) id: string,
    @Args('updatePurchaseOrderInput') input: UpdatePurchaseOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.updatePurchaseOrder(id, input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => TransferOrderEntity, { description: 'Creates a new transfer order.' })
  async createTransferOrder(
    @Args('createTransferOrderInput') input: CreateTransferOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.createTransferOrder(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => TransferOrderEntity, { description: 'Updates a transfer order.' })
  async updateTransferOrder(
    @Args('id', { type: () => String }) id: string,
    @Args('updateTransferOrderInput') input: UpdateTransferOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.updateTransferOrder(id, input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => InventoryAdjustmentEntity, { description: 'Creates an inventory adjustment.' })
  async createInventoryAdjustment(
    @Args('createInventoryAdjustmentInput') input: CreateInventoryAdjustmentInput,
    @Context() context,
  ) {
    return this.inventoryService.createInventoryAdjustment(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [LowStockAlertEntity], { name: 'lowStockAlerts', description: 'Retrieves low stock alerts for a store.' })
  async getLowStockAlerts(
    @Args('lowStockAlertInput') input: LowStockAlertInput,
    @Context() context,
  ) {
    return this.inventoryService.getLowStockAlerts(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => BulkImportResultEntity, { description: 'Imports products in bulk.' })
  async bulkImportProducts(
    @Args('storeId', { type: () => String }) storeId: string,
    @Args('products', { type: () => [PurchaseOrderProductInput] }) products: PurchaseOrderProductInput[],
    @Context() context,
  ) {
    return this.inventoryService.bulkImportProducts(storeId, products, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [PurchaseOrderProductEntity], { name: 'bulkExportProducts', description: 'Exports products for a store.' })
  async bulkExportProducts(
    @Args('storeId', { type: () => String }) storeId: string,
    @Context() context,
  ) {
    return this.inventoryService.bulkExportProducts(storeId, context.req.user);
  }
}

@ObjectType()
export class BulkImportResultEntity {
  @Field()
  success: boolean;

  @Field(() => Int)
  count: number;
}

// Module
@Module({
  providers: [
    InventoryResolver,
    InventoryService,
    PrismaService,
    StoreService,
    ProductService,
    BusinessService,
    WorkerService,
  ],
  imports: [StoreModule, ProductModule, BusinessModule, WorkerModule],
})
export class InventoryModule {}