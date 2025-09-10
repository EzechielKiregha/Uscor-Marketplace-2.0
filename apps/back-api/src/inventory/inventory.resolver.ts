import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Args,
  Int,
  Context,
} from '@nestjs/graphql'
import { InventoryService } from './inventory.service'
import {
  InventoryAdjustmentEntity,
  InventoryEntity,
  PaginatedInventoryResponse,
} from './entities/inventory.entity'
import { CreateInventoryAdjustmentInput } from './dto/create-inventory.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { PurchaseOrderProductEntity } from './entities/purchase-order-product.entity'
import { PurchaseOrderProductInput } from './dto/create-purchase-order-product.input'
import { BulkImportResultEntity } from './entities/bulk-import-result.entity'
import { LowStockAlertEntity } from './entities/low-stock-alert.entity'
import { UpdateTransferOrderInput } from './dto/update-transfer-order.input'
import {
  TransferOrderEntity,
  PaginatedTransferOrderResponse,
} from './entities/transfer-order.entity'
import { CreateTransferOrderInput } from './dto/create-transfer-order.input'
import {
  PurchaseOrderEntity,
  PaginatedPurchaseOrderResponse,
} from './entities/purchase-order.entity'
import { CreatePurchaseOrderInput } from './dto/create-purchase-order.input'
import { UpdatePurchaseOrderInput } from './dto/update-purchase-order.input'
import { LowStockAlertInput } from './dto/low-stock-alert.input'
import { PubSub } from 'graphql-subscriptions'
import { Inject } from '@nestjs/common'
import { StoreService } from '../store/store.service'

// Resolver
@Resolver(() => InventoryEntity)
export class InventoryResolver {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly storeService: StoreService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  // ============ QUERIES ============

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => PaginatedInventoryResponse, {
    name: 'inventory',
    description:
      'Retrieves inventory for a store.',
  })
  async getInventory(
    @Args('storeId', { nullable: true })
    storeId?: string,
    @Args('productId', { nullable: true })
    productId?: string,
    @Args('lowStockOnly', { nullable: true })
    lowStockOnly?: boolean,
    @Args('page', { defaultValue: 1 })
    page: number = 1,
    @Args('limit', { defaultValue: 20 })
    limit: number = 20,
    @Context() context?: any,
  ) {
    const user = context.req.user
    return this.inventoryService.getInventory(
      {
        storeId,
        productId,
        lowStockOnly,
        page,
        limit,
      },
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => PaginatedPurchaseOrderResponse, {
    name: 'purchaseOrders',
    description:
      'Retrieves purchase orders for a business.',
  })
  async getPurchaseOrders(
    @Args('businessId') businessId: string,
    @Args('storeId', { nullable: true })
    storeId?: string,
    @Args('status', { nullable: true })
    status?: string,
    @Args('startDate', { nullable: true })
    startDate?: Date,
    @Args('endDate', { nullable: true })
    endDate?: Date,
    @Args('page', { defaultValue: 1 })
    page: number = 1,
    @Args('limit', { defaultValue: 20 })
    limit: number = 20,
    @Context() context?: any,
  ) {
    const user = context.req.user
    return this.inventoryService.getPurchaseOrders(
      {
        businessId,
        storeId,
        status,
        startDate,
        endDate,
        page,
        limit,
      },
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => PaginatedTransferOrderResponse, {
    name: 'transferOrders',
    description: 'Retrieves transfer orders.',
  })
  async getTransferOrders(
    @Args('fromStoreId', { nullable: true })
    fromStoreId?: string,
    @Args('toStoreId', { nullable: true })
    toStoreId?: string,
    @Args('status', { nullable: true })
    status?: string,
    @Args('startDate', { nullable: true })
    startDate?: Date,
    @Args('endDate', { nullable: true })
    endDate?: Date,
    @Args('page', { defaultValue: 1 })
    page: number = 1,
    @Args('limit', { defaultValue: 20 })
    limit: number = 20,
    @Context() context?: any,
  ) {
    const user = context.req.user
    return this.inventoryService.getTransferOrders(
      {
        fromStoreId,
        toStoreId,
        status,
        startDate,
        endDate,
        page,
        limit,
      },
      user,
    )
  }

  // ============ MUTATIONS ============

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => PurchaseOrderEntity, {
    description: 'Creates a new purchase order.',
  })
  async createPurchaseOrder(
    @Args('input')
    input: CreatePurchaseOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.createPurchaseOrder(
      input,
      context.req.user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => PurchaseOrderEntity, {
    description: 'Updates a purchase order.',
  })
  async updatePurchaseOrder(
    @Args('id', { type: () => String })
    id: string,
    @Args('input')
    input: UpdatePurchaseOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.updatePurchaseOrder(
      id,
      input,
      context.req.user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => TransferOrderEntity, {
    description: 'Creates a new transfer order.',
  })
  async createTransferOrder(
    @Args('input')
    input: CreateTransferOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.createTransferOrder(
      input,
      context.req.user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => TransferOrderEntity, {
    description: 'Updates a transfer order.',
  })
  async updateTransferOrder(
    @Args('id', { type: () => String })
    id: string,
    @Args('input')
    input: UpdateTransferOrderInput,
    @Context() context,
  ) {
    return this.inventoryService.updateTransferOrder(
      id,
      input,
      context.req.user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => InventoryAdjustmentEntity, {
    description:
      'Creates an inventory adjustment.',
  })
  async createInventoryAdjustment(
    @Args('input')
    input: CreateInventoryAdjustmentInput,
    @Context() context,
  ) {
    return this.inventoryService.createInventoryAdjustment(
      input,
      context.req.user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [LowStockAlertEntity], {
    name: 'lowStockAlerts',
    description:
      'Retrieves low stock alerts for a store.',
  })
  async getLowStockAlerts(
    @Args('lowStockAlertInput')
    input: LowStockAlertInput,
    @Context() context,
  ) {
    return this.inventoryService.getLowStockAlerts(
      input,
      context.req.user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => BulkImportResultEntity, {
    description: 'Imports products in bulk.',
  })
  async bulkImportProducts(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Args('products', {
      type: () => [PurchaseOrderProductInput],
    })
    products: PurchaseOrderProductInput[],
    @Context() context,
  ) {
    return this.inventoryService.bulkImportProducts(
      storeId,
      products,
      context.req.user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [PurchaseOrderProductEntity], {
    name: 'bulkExportProducts',
    description: 'Exports products for a store.',
  })
  async bulkExportProducts(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Context() context,
  ) {
    return this.inventoryService.bulkExportProducts(
      storeId,
      context.req.user,
    )
  }

  // ============ SUBSCRIPTIONS ============

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Subscription(() => PurchaseOrderEntity, {
    filter: (payload, variables) => {
      return (
        payload.purchaseOrderCreated.storeId ===
        variables.storeId
      )
    },
  })
  async purchaseOrderCreated(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Args('businessId', { type: () => String })
    businessId: string,
    @Context() context: any,
  ) {
    const user = context.req.user
    await this.storeService.verifyStoreAccess(
      storeId,
      user,
    )

    return this.pubSub.asyncIterableIterator(
      `purchase_order_created_${storeId}`,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Subscription(() => PurchaseOrderEntity, {
    filter: (payload, variables) => {
      return (
        payload.purchaseOrderUpdated.storeId ===
        variables.storeId
      )
    },
  })
  async purchaseOrderUpdated(
    @Args('storeId') storeId: string,
    @Args('businessId', { type: () => String })
    businessId: string,
    @Context() context: any,
  ) {
    const user = context.req.user
    await this.storeService.verifyStoreAccess(
      storeId,
      user,
    )

    return this.pubSub.asyncIterableIterator(
      `purchase_order_updated_${storeId}`,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Subscription(() => TransferOrderEntity, {
    filter: (payload, variables) => {
      return (
        payload.transferOrderCreated
          .fromStoreId === variables.storeId ||
        payload.transferOrderCreated.toStoreId ===
          variables.storeId
      )
    },
  })
  async transferOrderCreated(
    @Args('fromStoreId') fromStoreId: string,
    @Args('toStoreId') toStoreId: string,
    @Context() context: any,
  ) {
    const user = context.req.user
    await this.storeService.verifyStoreAccess(
      fromStoreId,
      user,
    )

    return this.pubSub.asyncIterableIterator(
      `transfer_order_created_${fromStoreId}-${toStoreId}`,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Subscription(() => TransferOrderEntity, {
    filter: (payload, variables) => {
      return (
        payload.transferOrderUpdated
          .fromStoreId === variables.storeId ||
        payload.transferOrderUpdated.toStoreId ===
          variables.storeId
      )
    },
  })
  async transferOrderUpdated(
    @Args('fromStoreId') fromStoreId: string,
    @Context() context: any,
  ) {
    const user = context.req.user
    await this.storeService.verifyStoreAccess(
      fromStoreId,
      user,
    )

    return this.pubSub.asyncIterableIterator(
      `transfer_order_updated_${fromStoreId}`,
    )
  }
}
