import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { InventoryService } from './inventory.service';
import { InventoryAdjustmentEntity } from './entities/inventory.entity';
import { CreateInventoryAdjustmentInput } from './dto/create-inventory.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PurchaseOrderProductEntity } from './entities/purchase-order-product.entity';
import { PurchaseOrderProductInput } from './dto/create-purchase-order-product.input';
import { BulkImportResultEntity } from './entities/bulk-import-result.entity';
import { LowStockAlertEntity } from './entities/low-stock-alert.entity';
import { UpdateTransferOrderInput } from './dto/update-transfer-order.input';
import { TransferOrderEntity } from './entities/transfer-order.entity';
import { CreateTransferOrderInput } from './dto/create-transfer-order.input';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { CreatePurchaseOrderInput } from './dto/create-purchase-order.input';
import { UpdatePurchaseOrderInput } from './dto/update-purchase-order.input';
import { LowStockAlertInput } from './dto/low-stock-alert.input';

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