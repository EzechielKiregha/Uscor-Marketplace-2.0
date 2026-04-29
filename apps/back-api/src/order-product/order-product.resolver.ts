import { Resolver } from "@nestjs/graphql";
import { OrderProductEntity } from "./entities/order-product.entity";
import type { OrderProductService } from "./order-product.service";

@Resolver(() => OrderProductEntity)
export class OrderProductResolver {
	constructor(readonly orderProductService: OrderProductService) {}
}
