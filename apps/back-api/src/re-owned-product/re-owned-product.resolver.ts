import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ReOwnedProductService } from './re-owned-product.service';
import { ReOwnedProductEntity } from './entities/re-owned-product.entity';
import { ApproveReOwnedProductInput, CreateReOwnedProductInput } from './dto/create-re-owned-product.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ShippingEntity } from './entities/shipping.entity';
import { CreateShippingInput } from './dto/create-shipping.input';


// Resolver
@Resolver(() => ReOwnedProductEntity)
export class ReOwnedProductResolver {
  constructor(
    private readonly reOwnedProductService: ReOwnedProductService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ReOwnedProductEntity, { description: 'Initiates a re-ownership request.' })
  async createReOwnedProduct(
    @Args('createReOwnedProductInput') createReOwnedProductInput: CreateReOwnedProductInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (user.id !== createReOwnedProductInput.newOwnerId) {
      throw new Error('Businesses can only request re-ownership for themselves');
    }
    return this.reOwnedProductService.create(createReOwnedProductInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ReOwnedProductEntity, { description: 'Approves or rejects a re-ownership request.' })
  async approveReOwnedProduct(
    @Args('approveReOwnedProductInput') approveReOwnedProductInput: ApproveReOwnedProductInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.reOwnedProductService.approve(approveReOwnedProductInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ShippingEntity, { description: 'Creates shipping details for a re-owned product.' })
  async createShipping(
    @Args('createShippingInput') createShippingInput: CreateShippingInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.reOwnedProductService.createShipping(createShippingInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [ReOwnedProductEntity], { name: 'reOwnedProducts', description: 'Retrieves re-owned products for a business.' })
  async getReOwnedProducts(@Context() context) {
    const user = context.req.user;
    return this.reOwnedProductService.findAll(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => ReOwnedProductEntity, { name: 'reOwnedProduct', description: 'Retrieves a single re-owned product by ID.' })
  async getReOwnedProduct(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.reOwnedProductService.findOne(id, user.id);
  }
}

