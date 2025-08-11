import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { OrderEntity } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Resolver
@Resolver(() => OrderEntity)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => OrderEntity, { description: 'Creates an order for a product.' })
  async createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (user.id !== createOrderInput.clientId) {
      throw new Error('Clients can only create orders for themselves');
    }
    return this.orderService.create(createOrderInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => [OrderEntity], { name: 'orders', description: 'Retrieves orders.' })
  async getOrders(@Context() context) {
    const user = context.req.user;
    return this.orderService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => OrderEntity, { name: 'order', description: 'Retrieves a single order by ID.' })
  async getOrder(@Args('id', { type: () => String }) id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => OrderEntity, { description: 'Updates an order.' })
  async updateOrder(
    @Args('id', { type: () => String }) id: string,
    @Args('updateOrderInput') updateOrderInput: UpdateOrderInput,
    @Context() context,
  ) {
    const user = context.req.user;
    const order = await this.orderService.findOne(id);

    if (!order) throw new Error("Order not found")

    if (order.clientId !== user.id) {
      throw new Error('Clients can only update their own orders');
    }
    return this.orderService.update(id, updateOrderInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => OrderEntity, { description: 'Deletes an order.' })
  async deleteOrder(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    const order = await this.orderService.findOne(id);

    if (!order) throw new Error("Order not found")

    if (order.clientId !== user.id) {
      throw new Error('Clients can only delete their own orders');
    }
    return this.orderService.remove(id);
  }
}
