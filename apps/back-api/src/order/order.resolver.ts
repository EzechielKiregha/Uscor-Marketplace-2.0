import { UseGuards } from "@nestjs/common";
import {
    Args,
    Context,
    Int,
    Mutation,
    Query,
    Resolver,
    Subscription
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateOrderInput } from "./dto/create-order.input";
import { ProcessPaymentInput } from "./dto/process-payment.input";
import { GenerateOrderReceiptInput } from "./dto/receipt.input";
import { UpdateOrderInput, UpdateOrderStatusInput } from "./dto/update-order.input";
import { OrderBusinessGroupEntity } from "./entities/order-business-group.entity";
import {
    OrderEntity,
    OrderReceiptEntity,
    PaginatedOrdersResponse,
} from "./entities/order.entity";
import { OrderService } from "./order.service";

// Resolver
@Resolver(() => OrderEntity)
export class OrderResolver {
    private pubSub = new PubSub();

    constructor(private readonly orderService: OrderService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client")
    @Mutation(() => OrderEntity, {
        description: "Creates an order for a product.",
    })
    async createOrder(
        @Context() context,
        @Args("input") input: CreateOrderInput,
    ) {
        const user = context.req.user;
        if (user.id !== input.clientId) {
            throw new Error("Clients can only create orders for themselves");
        }
        const order = await this.orderService.create(input);

        // Publish subscription event
        this.pubSub.publish("orderCreated", {
            orderCreated: order,
        });

        return order;
    }

    // Business fetches their own order groups
    @Query(() => [OrderBusinessGroupEntity])
    @UseGuards(JwtAuthGuard, RolesGuard)
    async myBusinessOrders(@Context() context) {
        const user = context.user;

        if (user && user.role !== "business")
            throw Error("UnAuthorized Access");

        return this.orderService.getBusinessOrders(user.id);
    }

    // Client fetches full order with business breakdown
    // @Query(() => OrderEntity)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // async orderById(
    //     @Args("id", { type: () => String }) id: string,
    //     @Context() context,
    // ) {
    //     const user = context.user;
    //     return this.orderService.findOneWithGroups(id, user.id);
    // }

    // Resolve business details
    // @ResolveField(() => BusinessEntity)
    // async business(@Parent() group: OrderBusinessGroupEntity) {
    //     return group.business;
    // }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client", "business")
    @Query(() => [OrderEntity], {
        name: "orders",
        description: "Retrieves orders.",
    })
    async getOrders(@Context() context) {
        const _user = context.req.user;
        return this.orderService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client", "business")
    @Query(() => OrderEntity, {
        name: "order",
        description: "Retrieves a single order by ID.",
    })
    async getOrder(
        @Args("id", { type: () => String })
        id: string,
    ) {
        return this.orderService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("business", "worker")
    @Query(() => PaginatedOrdersResponse, {
        name: "businessOrders",
        description: "Retrieves orders for a business.",
    })
    async getBusinessOrders(
        @Args("businessId", { type: () => String })
        businessId: string,
        @Args("page", {
            type: () => Int,
            defaultValue: 1,
        })
        page: number,
        @Args("limit", {
            type: () => Int,
            defaultValue: 20,
        })
        limit: number,
        @Args("search", {
            type: () => String,
            nullable: true,
        })
        search?: string,
        @Args("status", {
            type: () => String,
            nullable: true,
        })
        status?: string,
        @Args("date", {
            type: () => String,
            nullable: true,
        })
        date?: string,
        @Context() _context?: any,
    ) {
        return this.orderService.findBusinessOrders(
            businessId,
            page,
            limit,
            search,
            status,
            date,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client")
    @Query(() => PaginatedOrdersResponse, {
        name: "clientOrders",
        description: "Retrieves orders for a client.",
    })
    async getClientOrders(
        @Args("clientId", { type: () => String })
        clientId: string,
        @Args("page", {
            type: () => Int,
            defaultValue: 1,
        })
        page: number,
        @Args("limit", {
            type: () => Int,
            defaultValue: 20,
        })
        limit: number,
        @Args("status", {
            type: () => String,
            nullable: true,
        })
        status?: string,
        @Context() context?: any,
    ) {
        return this.orderService.findClientOrders(
            clientId,
            page,
            limit,
            status,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client")
    @Mutation(() => OrderEntity, {
        description: "Updates an order.",
    })
    async updateOrder(
        @Args("id", { type: () => String })
        id: string,
        @Args("input")
        input: UpdateOrderInput,
        @Context() context,
    ) {
        const user = context.req.user;
        const order = await this.orderService.findOne(id);

        if (!order) throw new Error("Order not found");

        if (order.clientId !== user.id) {
            throw new Error("Clients can only update their own orders");
        }
        const updatedOrder = await this.orderService.update(id, input);

        // Publish subscription event
        this.pubSub.publish("orderUpdated", {
            orderUpdated: updatedOrder,
        });

        return updatedOrder;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client")
    @Mutation(() => OrderEntity, {
        description: "Deletes an order.",
    })
    async deleteOrder(
        @Args("id", { type: () => String })
        id: string,
        @Context() context,
    ) {
        const user = context.req.user;
        const order = await this.orderService.findOne(id);

        if (!order) throw new Error("Order not found");

        if (order.clientId !== user.id) {
            throw new Error("Clients can only delete their own orders");
        }
        return this.orderService.remove(id);
    }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client")
    @Mutation(() => OrderEntity, {
        description: "Cancel an order.",
    })
    async cancelOrder(
        @Args("id", { type: () => String })
        id: string,
        @Context() context,
    ) {
        const user = context.req.user;
        const order = await this.orderService.findOne(id);

        if (!order) throw new Error("Order not found");

        if (order.clientId !== user.id) {
            throw new Error("Clients can only delete their own orders");
        }
        return this.orderService.cancelOrder(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("business")
    @Mutation(() => OrderEntity, {
        description: "Process payment for an order.",
    })
    async processOrderPayment(
        @Args("orderId", { type: () => String })
        orderId: string,
        @Args("input") input: ProcessPaymentInput,
        @Context() _context,
    ) {
        const processedOrder = await this.orderService.processPayment(
            orderId,
            input,
        );

        // Publish subscription event
        this.pubSub.publish("orderPaymentProcessed", {
            orderPaymentProcessed: processedOrder,
        });

        return processedOrder;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("client")
    @Mutation(() => OrderReceiptEntity, {
        description: "Generates a PDF receipt for the order.",
    })
    async generateOrderReceipt(
        @Args("input") input: GenerateOrderReceiptInput,
        @Context() context,
    ) {
        const user = context.req.user;
        return this.orderService.generateReceipt(input, user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("worker", "business", "admin")
    @Mutation(() => OrderBusinessGroupEntity, {
        description: "Updates the status of an order business group. Workers set PROCESSING/READY_FOR_SHIPMENT, admins set SHIPPED/DELIVERED/COMPLETED.",
    })
    async updateBusinessOrderStatus(
        @Args("input") input: UpdateOrderStatusInput,
        @Context() context,
    ) {
        const user = context.req.user;
        const updated = await this.orderService.updateOrderStatus(
            input.businessGroupId,
            input.status,
            user.id,
            user.role,
        );

        // Publish subscription event
        this.pubSub.publish("orderUpdated", {
            orderUpdated: updated.order,
        });

        return updated;
    }

    // Subscriptions
    @Subscription(() => OrderEntity, {
        filter: (payload, variables) => {
            return (
                payload.orderCreated.clientId === variables.clientId ||
                payload.orderCreated.products?.some(
                    (p: any) => p.product.businessId === variables.businessId,
                )
            );
        },
    })
    orderCreated(
        @Args("clientId", { type: () => String })
        _clientId: string,
        @Args("businessId", { type: () => String })
        _businessId: string,
    ) {
        return this.pubSub.asyncIterableIterator("orderCreated");
    }

    @Subscription(() => OrderEntity, {
        filter: (payload, variables) => {
            return (
                payload.orderUpdated.clientId === variables.clientId ||
                payload.orderUpdated.products?.some(
                    (p: any) => p.product.businessId === variables.businessId,
                )
            );
        },
    })
    orderUpdated(
        @Args("clientId", { type: () => String })
        _clientId: string,
        @Args("businessId", { type: () => String })
        _businessId: string,
    ) {
        return this.pubSub.asyncIterableIterator("orderUpdated");
    }

    @Subscription(() => OrderEntity, {
        filter: (payload, variables) => {
            return payload.orderPaymentProcessed.id === variables.orderId;
        },
    })
    orderPaymentProcessed(
        @Args("orderId", { type: () => String })
        _orderId: string,
    ) {
        return this.pubSub.asyncIterableIterator("orderPaymentProcessed");
    }
}
