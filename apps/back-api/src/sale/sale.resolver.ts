import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { SaleService } from './sale.service';
import { CreateSaleInput } from './dto/create-sale.input';
import { UpdateSaleInput } from './dto/update-sale.input';
import { SaleEntity } from './entities/sale.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CloseSaleInput } from './dto/close-sale.input';
import { CreateReturnInput } from './dto/create-return.input';
import { ReturnEntity } from './entities/return.entity';
import { StoreService } from 'src/store/store.service';

// Resolver
@Resolver(() => SaleEntity)
export class SaleResolver {
  constructor(
    private readonly saleService: SaleService,
    private readonly storeService: StoreService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => SaleEntity, { description: 'Creates a new POS sale.' })
  async createSale(
    @Args('createSaleInput') createSaleInput: CreateSaleInput,
    @Context() context,
  ) {
    return this.saleService.create(createSaleInput, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => SaleEntity, { description: 'Updates an existing POS sale.' })
  async updateSale(
    @Args('id', { type: () => String }) id: string,
    @Args('updateSaleInput') updateSaleInput: UpdateSaleInput,
    @Context() context,
  ) {
    return this.saleService.update(id, updateSaleInput, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => SaleEntity, { description: 'Closes a POS sale.' })
  async closeSale(
    @Args('closeSaleInput') closeSaleInput: CloseSaleInput,
    @Context() context,
  ) {
    return this.saleService.close(closeSaleInput, context.req.user);
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
  @Query(() => [SaleEntity], { name: 'sales', description: 'Retrieves sales for a store.' })
  async getSales(
    @Args('storeId', { type: () => String }) storeId: string,
    @Context() context,
  ) {
    return this.saleService.findAll(storeId, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => SaleEntity, { name: 'sale', description: 'Retrieves a single sale by ID.' })
  async getSale(
    @Args('id', { type: () => String }) id: string,
    @Context() context,
  ) {
    return this.saleService.findOne(id, context.req.user);
  }
}

