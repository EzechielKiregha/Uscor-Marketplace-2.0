import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { FreelanceOrderService } from './freelance-order.service';
import { FreelanceOrderEntity } from './entities/freelance-order.entity';
import { CreateFreelanceOrderInput } from './dto/create-freelance-order.input';
import { AssignBusinessesInput, UpdateFreelanceOrderInput } from './dto/update-freelance-order.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Resolver
@Resolver(() => FreelanceOrderEntity)
export class FreelanceOrderResolver {
  constructor(
    private readonly freelanceOrderService: FreelanceOrderService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => FreelanceOrderEntity, { description: 'Creates a new freelance order.' })
  async createFreelanceOrder(
    @Args('createFreelanceOrderInput') createFreelanceOrderInput: CreateFreelanceOrderInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.freelanceOrderService.create(createFreelanceOrderInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => [FreelanceOrderEntity], { name: 'freelanceOrders', description: 'Retrieves freelance orders based on user role.' })
  async getFreelanceOrders(@Context() context) {
    const user = context.req.user;
    return this.freelanceOrderService.findAll(user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => FreelanceOrderEntity, { name: 'freelanceOrder', description: 'Retrieves a single freelance order by ID.' })
  async getFreelanceOrder(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    const order = await this.freelanceOrderService.findOne(id);
    if (user.role === 'client' && order.clientId !== user.id) {
      throw new Error('Clients can only access their own orders');
    }
    if (
      user.role === 'business' &&
      order.service.businessId !== user.id &&
      !order.freelanceOrderBusiness.some(b => b.businessId === user.id)
    ) {
      throw new Error('Businesses can only access orders for their services or assigned orders');
    }
    return order;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Mutation(() => FreelanceOrderEntity, { description: 'Updates a freelance order’s status or escrow status.' })
  async updateFreelanceOrder(
    @Args('id', { type: () => String }) id: string,
    @Args('updateFreelanceOrderInput') updateFreelanceOrderInput: UpdateFreelanceOrderInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.freelanceOrderService.update(id, updateFreelanceOrderInput, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => FreelanceOrderEntity, { description: 'Assigns businesses to a freelance order.' })
  async assignBusinessesToOrder(
    @Args('assignBusinessesInput') assignBusinessesInput: AssignBusinessesInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.freelanceOrderService.assignBusinesses(assignBusinessesInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Mutation(() => FreelanceOrderEntity, { description: 'Deletes a freelance order.' })
  async deleteFreelanceOrder(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.freelanceOrderService.remove(id, user.id, user.role);
  }
}

