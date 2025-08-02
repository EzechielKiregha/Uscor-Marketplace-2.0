import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrderProductService } from './order-product.service';
import { OrderProductEntity } from './entities/order-product.entity';
import { CreateOrderProductInput } from './dto/create-order-product.input';
import { UpdateOrderProductInput } from './dto/update-order-product.input';

@Resolver(() => OrderProductEntity)
export class OrderProductResolver {
  constructor(private readonly orderProductService: OrderProductService) {}
}
