import { Resolver, Query, Mutation, Args, Int, Context, Subscription, Float } from '@nestjs/graphql';
import { FreelanceOrderService } from './freelance-order.service';
import { FreelanceOrderEntity, PaginatedFreelanceOrdersResponse } from './entities/freelance-order.entity';
import { CreateFreelanceOrderInput, FreelanceStatus } from './dto/create-freelance-order.input';
import { AssignBusinessesInput, UpdateFreelanceOrderInput } from './dto/update-freelance-order.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

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
    @Args('input') input: CreateFreelanceOrderInput,
    @Context() context,
  ) {
    const user = context.req.user;
    const order = await this.freelanceOrderService.create(input, user.id);
    
    // Publish subscription event
    pubSub.publish('freelanceOrderCreated', { 
      freelanceOrderCreated: order,
      clientId: user.id 
    });
    
    return order;
  }

  @Query(() => PaginatedFreelanceOrdersResponse, { name: 'freelanceOrders', description: 'Retrieves freelance orders with pagination and filters.' })
  async freelanceOrders(
    @Args('serviceId', { type: () => String, nullable: true }) serviceId?: string,
    @Args('clientId', { type: () => String, nullable: true }) clientId?: string,
    @Args('businessId', { type: () => String, nullable: true }) businessId?: string,
    @Args('status', { type: () => FreelanceStatus, nullable: true }) status?: FreelanceStatus,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number = 20,
  ) {
    return this.freelanceOrderService.findAll({
      serviceId,
      clientId,
      businessId,
      status,
      page,
      limit
    });
  }

  @Query(() => FreelanceOrderEntity, { name: 'freelanceOrder', description: 'Retrieves a single freelance order by ID.' })
  async freelanceOrder(@Args('id', { type: () => String }) id: string) {
    return this.freelanceOrderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Mutation(() => FreelanceOrderEntity, { description: 'Updates a freelance order.' })
  async updateFreelanceOrder(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateFreelanceOrderInput,
    @Context() context,
  ) {
    const user = context.req.user;
    const order = await this.freelanceOrderService.update(id, input, user.id, user.role);

    if (!order) throw new Error(`Failed to update freelance order ${id}.`);
    
    // Publish subscription event
    pubSub.publish('freelanceOrderUpdated', { 
      freelanceOrderUpdated: order,
      userId: user.role === "bussiness" ? user.id : null
    });
    
    return order;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceOrderEntity, { description: 'Complete a freelance order.' })
  async completeFreelanceOrder(
    @Args('id', { type: () => String }) id: string,
    @Context() context,
  ) {
    const user = context.req.user;
    const order = await this.freelanceOrderService.completeOrder(id, user.id);
    
    // Publish subscription event
    pubSub.publish('freelanceOrderUpdated', { 
      freelanceOrderUpdated: order,
      businessId: user.id 
    });
    
    return order;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Mutation(() => FreelanceOrderEntity, { description: 'Release escrow for a freelance order.' })
  async releaseEscrow(
    @Args('orderId', { type: () => String }) orderId: string,
    @Context() context,
  ) {
    const user = context.req.user;
    const order = await this.freelanceOrderService.releaseEscrow(orderId, user.id, user.role);
    
    // Publish subscription event
    pubSub.publish('freelanceOrderUpdated', { 
      freelanceOrderUpdated: order,
      businessId: order.service.businessId 
    });
    
    return order;
  }

  // Subscriptions
  @Subscription(() => FreelanceOrderEntity, {
    filter: (payload, variables) => {
      return payload.clientId === variables.clientId;
    },
  })
  freelanceOrderCreated(@Args('clientId') clientId: string) {
    return pubSub.asyncIterableIterator('freelanceOrderCreated');
  }

  @Subscription(() => FreelanceOrderEntity, {
    filter: (payload, variables) => {
      return payload.businessId === variables.businessId;
    },
  })
  freelanceOrderUpdated(@Args('businessId') businessId: string) {
    return pubSub.asyncIterableIterator('freelanceOrderUpdated');
  }
}