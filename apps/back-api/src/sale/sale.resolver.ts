import { Resolver, Query, Mutation, Args, Int, Context, Subscription } from '@nestjs/graphql';
import { SaleService } from './sale.service';
import { CreateSaleInput } from './dto/create-sale.input';
import { UpdateSaleInput } from './dto/update-sale.input';
import { SaleEntity } from './entities/sale.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Inject, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloseSaleInput } from './dto/close-sale.input';
import { CreateReturnInput } from './dto/create-return.input';
import { ReturnEntity } from './entities/return.entity';
import { StoreService } from '../store/store.service';
import { ReceiptEntity } from './entities/receipt.entity';
import { GenerateReceiptInput } from './dto/receipt.input';
import { PaginatedSalesResponse } from './entities/paginated-sales-response.entity';
import { SalesDashboard } from './entities/sales-dashboard.entity';
import { SaleProductEntity } from './entities/sale-product.entity';
import { AddSaleProductInput } from './dto/add-sale-product.input';
import { UpdateSaleProductInput } from './dto/update-sale-product.input';
import { DeleteResponse } from './entities/delete-response.entity';
import { PaymentMethod } from '../payment-transaction/dto/create-payment-transaction.input';
import { PubSub } from 'graphql-subscriptions';

// Resolver
@Resolver(() => SaleEntity)
export class SaleResolver {
  constructor(
    private readonly saleService: SaleService,
    private readonly storeService: StoreService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}
// ============ QUERIES ============

  @Query(() => [SaleEntity])
  async activeSales(
    @Args('storeId') storeId: string,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.findActiveSales(storeId, user);
  }

  @Query(() => SaleEntity)
  async sale(
    @Args('id') id: string,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.findOne(id, user);
  }

  @Query(() => PaginatedSalesResponse)
  async sales(
    @Context() context: any,
    @Args('storeId', { nullable: true }) storeId?: string,
    @Args('workerId', { nullable: true }) workerId?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('status', { nullable: true }) status?: string,
    @Args('page', { defaultValue: 1 }) page: number = 1,
    @Args('limit', { defaultValue: 20 }) limit: number = 20,
  ) {
    const user = context.req.user;
    return this.saleService.findSalesWithPagination(
      { storeId, workerId, startDate, endDate, status, page, limit },
      user
    );
  }

  @Query(() => SalesDashboard)
  async salesDashboard(
    @Args('storeId') storeId: string,
    @Args('period', { defaultValue: 'day' }) period: string = 'day',
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.getSalesDashboard(storeId, period, user);
  }

  // ============ MUTATIONS ============

  @Mutation(() => SaleEntity)
  async createSale(
    @Args('input') createSaleInput: CreateSaleInput,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.create(createSaleInput, user);
  }

  @Mutation(() => SaleEntity)
  async updateSale(
    @Args('id') id: string,
    @Args('input') updateSaleInput: UpdateSaleInput,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.update(id, updateSaleInput, user);
  }

  @Mutation(() => SaleEntity)
  async closeSale(
    @Args('input') closeSaleInput: CloseSaleInput,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.close(closeSaleInput, user);
  }

  @Mutation(() => SaleEntity)
  async completeSale(
    @Args('id') id: string,
    @Args('paymentMethod') paymentMethod: PaymentMethod,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.completeSale(id, paymentMethod, user);
  }

  @Mutation(() => SaleProductEntity)
  async addSaleProduct(
    @Args('input') input: AddSaleProductInput,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.addSaleProduct(input, user);
  }

  @Mutation(() => SaleProductEntity)
  async updateSaleProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateSaleProductInput,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.updateSaleProduct(id, input, user);
  }

  @Mutation(() => DeleteResponse)
  async removeSaleProduct(
    @Args('id') id: string,
    @Context() context: any
  ) {
    const user = context.req.user;
    return this.saleService.removeSaleProduct(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => ReturnEntity, { description: 'Processes a return for a POS sale.' })
  async createReturn(
    @Args('createReturnInput') createReturnInput: CreateReturnInput,
    @Context() context,
  ) {
    return this.saleService.createReturn(createReturnInput, context.req.user);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => ReceiptEntity, { description: 'Generates a PDF receipt and optionally emails it.' })
  async generateReceipt(
    @Args('generateReceiptInput') input: GenerateReceiptInput,
    @Context() context,
  ) {
    return this.saleService.generateReceipt(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => ReceiptEntity, { description: 'Generates a PDF receipt using pdfkit and optionally emails it.' })
  async generateReceiptWithPDFKit(
  @Args('generateReceiptInput') input: GenerateReceiptInput,
  @Context() context,
  ) {
  return this.saleService.generateReceiptWithPDFKit(input, context.req.user);
  }

// ============ SUBSCRIPTIONS ============

  @Subscription(() => SaleEntity, {
    filter: (payload, variables) => {
      return payload.saleCreated.storeId === variables.storeId;
    },
  })
  async saleCreated(
    @Args('storeId') storeId: string,
    @Context() context: any
  ) {
    const user = context.req.user;
    await this.storeService.verifyStoreAccess(storeId, user);
    
    return this.pubSub.asyncIterableIterator(`sale_created_${storeId}`);
  }

  @Subscription(() => SaleEntity, {
    filter: (payload, variables) => {
      return payload.saleUpdated.storeId === variables.storeId;
    },
  })
  async saleUpdated(
    @Args('storeId') storeId: string,
    @Context() context: any
  ) {
    const user = context.req.user;
    await this.storeService.verifyStoreAccess(storeId, user);
    
    return this.pubSub.asyncIterableIterator(`sale_updated_${storeId}`);
  }
}