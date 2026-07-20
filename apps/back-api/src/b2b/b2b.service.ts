import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { ChatService } from "../chat/chat.service";
import { PusherService } from "../chat/pusher.service";
import { lineTotal, sumPrecise } from "../common/token-math";
import {
    B2BPaymentTerms,
    ChatStatus,
    PaymentStatus,
} from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import {
    CreateB2BOrderInput,
    UpdateB2BOrderStatusInput,
} from "./dto/create-b2b-order.input";
import {
    CreateWholesalePriceInput,
    UpdateWholesalePriceInput,
} from "./dto/create-wholesale-price.input";

const B2B_ORDER_INCLUDE = {
    items: { include: { product: true } },
    buyer: {
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            businessType: true,
            kycStatus: true,
            phone: true,
        },
    },
    seller: {
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            businessType: true,
            kycStatus: true,
            phone: true,
        },
    },
    payment: {
        select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            createdAt: true,
        },
    },
};

@Injectable()
export class B2BService {
    private readonly logger = new Logger(B2BService.name);

    constructor(
        private prisma: PrismaService,
        private pusherService: PusherService,
        private chatService: ChatService,
    ) {}

    // ─── Wholesale Pricing ──────────────────────────────────

    async createWholesalePrice(
        businessId: string,
        input: CreateWholesalePriceInput,
    ) {
        const client = this.prisma as any;

        // Verify the product belongs to this business
        const product = await client.product.findFirst({
            where: { id: input.productId, businessId },
        });
        if (!product)
            throw new NotFoundException(
                "Product not found or does not belong to your business",
            );

        // Validate tier: price must be less than retail
        if (input.price >= product.price) {
            throw new BadRequestException(
                "Wholesale price must be less than retail price",
            );
        }

        return client.wholesalePrice.create({
            data: { ...input, businessId },
        });
    }

    async updateWholesalePrice(
        businessId: string,
        input: UpdateWholesalePriceInput,
    ) {
        const client = this.prisma as any;

        const existing = await client.wholesalePrice.findFirst({
            where: { id: input.id, businessId },
        });
        if (!existing)
            throw new NotFoundException("Wholesale price tier not found");

        const { id, ...data } = input;
        return client.wholesalePrice.update({ where: { id }, data });
    }

    async deleteWholesalePrice(businessId: string, id: string) {
        const client = this.prisma as any;

        const existing = await client.wholesalePrice.findFirst({
            where: { id, businessId },
        });
        if (!existing)
            throw new NotFoundException("Wholesale price tier not found");

        return client.wholesalePrice.delete({ where: { id } });
    }

    async getWholesalePrices(productId: string) {
        const client = this.prisma as any;
        return client.wholesalePrice.findMany({
            where: { productId, isActive: true },
            orderBy: { minQuantity: "asc" },
        });
    }

    async getBusinessWholesalePrices(businessId: string) {
        const client = this.prisma as any;
        return client.wholesalePrice.findMany({
            where: { businessId },
            include: {
                product: {
                    select: { id: true, title: true, price: true, stock: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    // ─── B2B Verification Gate ──────────────────────────────

    private async verifyB2BEligibility(businessId: string) {
        const client = this.prisma as any;
        const business = await client.business.findUnique({
            where: { id: businessId },
            select: { kycStatus: true, isB2BEnabled: true },
        });
        if (!business) throw new NotFoundException("Business not found");
        if (business.kycStatus !== "VERIFIED") {
            throw new ForbiddenException(
                "Business must be KYC-verified to use B2B features",
            );
        }
        if (!business.isB2BEnabled) {
            throw new ForbiddenException(
                "B2B is not enabled for this business",
            );
        }
    }

    // ─── B2B Orders ─────────────────────────────────────────

    async createB2BOrder(buyerId: string, input: CreateB2BOrderInput) {
        const client = this.prisma;

        // Verify both buyer and seller are B2B eligible
        await this.verifyB2BEligibility(buyerId);
        await this.verifyB2BEligibility(input.sellerId);

        if (buyerId === input.sellerId) {
            throw new BadRequestException(
                "Cannot create a B2B order with yourself",
            );
        }

        // Resolve prices from wholesale tiers or fall back to retail
        const itemsWithPrices = await Promise.all(
            input.items.map(async (item) => {
                const product = await client.product.findFirst({
                    where: { id: item.productId, businessId: input.sellerId },
                });
                if (!product)
                    throw new NotFoundException(
                        `Product ${item.productId} not found for this seller`,
                    );

                // Find applicable wholesale tier
                const tier = await client.wholesalePrice.findFirst({
                    where: {
                        productId: item.productId,
                        isActive: true,
                        minQuantity: { lte: item.quantity },
                        OR: [
                            { maxQuantity: null },
                            { maxQuantity: { gte: item.quantity } },
                        ],
                    },
                    orderBy: { minQuantity: "desc" }, // Best tier first
                });

                const unitPrice = tier ? tier.price : product.price;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice: lineTotal(unitPrice, item.quantity),
                    notes: item.notes,
                };
            }),
        );

        const subtotal = sumPrecise(itemsWithPrices.map((i) => i.totalPrice));

        const order = await client.b2BOrder.create({
            data: {
                buyerId,
                sellerId: input.sellerId,
                status: "DRAFT",
                paymentTerms:
                    input.paymentTerms === "ON_DELIVERY"
                        ? B2BPaymentTerms.ON_DELIVERY
                        : input.paymentTerms === "NET_15"
                          ? B2BPaymentTerms.NET_15
                          : input.paymentTerms === "NET_30"
                            ? B2BPaymentTerms.NET_30
                            : input.paymentTerms === "NET_60"
                              ? B2BPaymentTerms.NET_60
                              : B2BPaymentTerms.PREPAID,
                notes: input.notes,
                shippingAddress: input.shippingAddress,
                subtotal,
                tax: 0,
                total: subtotal,
                items: { create: itemsWithPrices },
            },
            include: B2B_ORDER_INCLUDE,
        });

        // Create B2B order chat between buyer and seller
        try {
            const sellerBusiness = await client.business.findUnique({
                where: { id: input.sellerId },
                select: { id: true, name: true },
            });
            const buyerBusiness = await client.business.findUnique({
                where: { id: buyerId },
                select: { id: true, name: true },
            });

            if (sellerBusiness && buyerBusiness) {
                const chat = await this.prisma.chat.create({
                    data: {
                        status: ChatStatus.ACTIVE,
                        isSecure: false,
                        negotiationType: "ORDER" as any,
                        participants: {
                            create: [
                                { businessId: buyerId },
                                { businessId: input.sellerId },
                            ],
                        },
                    },
                });

                const orderRef = order.orderNumber.substring(0, 8).toUpperCase();
                await this.prisma.chatMessage.create({
                    data: {
                        chat: { connect: { id: chat.id } },
                        message: `B2B Order #${orderRef} created — ${itemsWithPrices.length} item${itemsWithPrices.length > 1 ? "s" : ""}, $${subtotal.toFixed(2)} from ${buyerBusiness.name} to ${sellerBusiness.name}. Use this chat for negotiation and order coordination.`,
                        senderId: "system",
                    },
                });

                // Notify seller of new B2B order
                await this.pusherService.trigger(
                    `business-${input.sellerId}`,
                    "b2b-order-new",
                    {
                        orderId: order.id,
                        orderRef,
                        buyerName: buyerBusiness.name,
                        itemCount: itemsWithPrices.length,
                        total: subtotal,
                        chatId: chat.id,
                    },
                );
            }
        } catch (chatError) {
            this.logger.warn(
                `Failed to create B2B order chat for order ${order.id}`,
                chatError,
            );
        }

        return order;
    }

    async submitB2BOrder(businessId: string, orderId: string) {
        const client = this.prisma as any;

        const order = await client.b2BOrder.findFirst({
            where: { id: orderId, buyerId: businessId, status: "DRAFT" },
        });
        if (!order) throw new NotFoundException("Draft order not found");

        return client.b2BOrder.update({
            where: { id: orderId },
            data: { status: "SUBMITTED", submittedAt: new Date() },
            include: B2B_ORDER_INCLUDE,
        });
    }

    async updateB2BOrderStatus(
        businessId: string,
        input: UpdateB2BOrderStatusInput,
    ) {
        const client = this.prisma as any;

        const order = await client.b2BOrder.findFirst({
            where: { id: input.orderId },
            include: { items: true },
        });
        if (!order) throw new NotFoundException("Order not found");

        // Validate state transitions & permissions
        const validTransitions: Record<
            string,
            { next: string[]; role: "buyer" | "seller" | "both" }
        > = {
            SUBMITTED: { next: ["UNDER_REVIEW", "CANCELLED"], role: "both" },
            UNDER_REVIEW: { next: ["APPROVED", "REJECTED"], role: "seller" },
            APPROVED: { next: ["PROCESSING", "CANCELLED"], role: "seller" },
            PROCESSING: { next: ["SHIPPED"], role: "seller" },
            SHIPPED: { next: ["DELIVERED"], role: "both" },
        };

        const currentTransition = validTransitions[order.status];
        if (
            !currentTransition ||
            !currentTransition.next.includes(input.status)
        ) {
            throw new BadRequestException(
                `Cannot transition from ${order.status} to ${input.status}`,
            );
        }

        const isBuyer = order.buyerId === businessId;
        const isSeller = order.sellerId === businessId;
        if (!isBuyer && !isSeller)
            throw new ForbiddenException("Not part of this order");

        if (currentTransition.role === "seller" && !isSeller) {
            throw new ForbiddenException(
                "Only the seller can perform this action",
            );
        }
        if (currentTransition.role === "buyer" && !isBuyer) {
            throw new ForbiddenException(
                "Only the buyer can perform this action",
            );
        }

        const updateData: any = {
            status: input.status,
            notes: input.notes || order.notes,
        };

        if (input.status === "REJECTED")
            updateData.rejectionReason = input.rejectionReason;
        if (input.status === "APPROVED") updateData.approvedAt = new Date();
        if (input.status === "SHIPPED") updateData.shippedAt = new Date();
        if (input.status === "DELIVERED") updateData.deliveredAt = new Date();
        if (input.status === "CANCELLED") updateData.cancelledAt = new Date();

        const updatedOrder = await client.b2BOrder.update({
            where: { id: input.orderId },
            data: updateData,
            include: B2B_ORDER_INCLUDE,
        });

        // Log settlement-relevant transitions
        if (input.status === "DELIVERED") {
            this.logger.log(
                `B2B order ${input.orderId} delivered: $${order.total} from buyer ${order.buyerId} to seller ${order.sellerId}`,
            );
        }
        if (input.status === "CANCELLED" && order.status === "APPROVED") {
            this.logger.warn(
                `B2B order ${input.orderId} cancelled after approval — review if payment was taken`,
            );
        }

        // Create payment transaction when order is approved (PREPAID terms)
        if (input.status === "APPROVED") {
            try {
                await this.prisma.paymentTransaction.create({
                    data: {
                        amount: order.total,
                        method: "MOBILE_MONEY" as any,
                        status: PaymentStatus.PENDING,
                        b2bOrderId: order.id,
                    },
                });
            } catch (payErr) {
                this.logger.warn(
                    `Failed to create payment for B2B order ${order.id}`,
                    payErr,
                );
            }
        }

        // Pusher notifications for both parties
        const orderRef = order.orderNumber?.substring(0, 8)?.toUpperCase() || order.id.substring(0, 8).toUpperCase();
        const statusMessages: Record<string, string> = {
            UNDER_REVIEW: "is now under review",
            APPROVED: "has been approved",
            REJECTED: `has been rejected${input.rejectionReason ? `: ${input.rejectionReason}` : ""}`,
            PROCESSING: "is being processed",
            SHIPPED: "has been shipped",
            DELIVERED: "has been delivered",
            CANCELLED: "has been cancelled",
        };

        const eventPayload = {
            orderId: order.id,
            orderRef,
            status: input.status,
            total: order.total,
            message: `B2B Order #${orderRef} ${statusMessages[input.status] || "status updated"}`,
        };

        // Notify the other party (buyer or seller)
        try {
            if (isSeller) {
                await this.pusherService.trigger(
                    `business-${order.buyerId}`,
                    "b2b-order-update",
                    { ...eventPayload, updatedBy: "seller" },
                );
            }
            if (isBuyer) {
                await this.pusherService.trigger(
                    `business-${order.sellerId}`,
                    "b2b-order-update",
                    { ...eventPayload, updatedBy: "buyer" },
                );
            }
        } catch (pusherErr) {
            this.logger.warn(`Failed to send B2B Pusher notification`, pusherErr);
        }

        return updatedOrder;
    }

    async getB2BOrders(
        businessId: string,
        role: "buyer" | "seller" | "all",
        status?: string,
        page = 1,
        limit = 20,
    ) {
        const client = this.prisma as any;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (role === "buyer") where.buyerId = businessId;
        else if (role === "seller") where.sellerId = businessId;
        else where.OR = [{ buyerId: businessId }, { sellerId: businessId }];

        if (status) where.status = status;

        const [items, total] = await Promise.all([
            client.b2BOrder.findMany({
                where,
                include: B2B_ORDER_INCLUDE,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            client.b2BOrder.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async getB2BOrder(businessId: string, orderId: string) {
        const client = this.prisma as any;

        const order = await client.b2BOrder.findFirst({
            where: {
                id: orderId,
                OR: [{ buyerId: businessId }, { sellerId: businessId }],
            },
            include: B2B_ORDER_INCLUDE,
        });
        if (!order) throw new NotFoundException("Order not found");
        return order;
    }

    // ─── Vendor Discovery ───────────────────────────────────

    async getB2BVendors(page = 1, limit = 20, businessType?: string) {
        const client = this.prisma as any;
        const skip = (page - 1) * limit;

        const where: any = {
            isB2BEnabled: true,
            kycStatus: "VERIFIED",
        };
        if (businessType) where.businessType = businessType;

        const [items, total] = await Promise.all([
            client.business.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    businessType: true,
                    description: true,
                    address: true,
                    totalProductsSold: true,
                    _count: {
                        select: { products: true, stores: true, workers: true },
                    },
                },
                orderBy: { totalProductsSold: "desc" },
                skip,
                take: limit,
            }),
            client.business.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    // ─── B2B Payment ───────────────────────────────────────

    async payB2BOrder(businessId: string, orderId: string, method: string) {
        const client = this.prisma as any;

        const order = await client.b2BOrder.findFirst({
            where: { id: orderId, buyerId: businessId },
            include: { payment: true, seller: { select: { id: true, name: true } } },
        });
        if (!order) throw new NotFoundException("B2B order not found");
        if (!["APPROVED", "PROCESSING"].includes(order.status)) {
            throw new BadRequestException("Order must be approved before payment");
        }
        if (order.payment?.status === "COMPLETED") {
            throw new BadRequestException("Order is already paid");
        }

        // Update existing payment or create one
        let payment;
        if (order.payment) {
            payment = await this.prisma.paymentTransaction.update({
                where: { id: order.payment.id },
                data: { status: PaymentStatus.COMPLETED, method: method as any },
            });
        } else {
            payment = await this.prisma.paymentTransaction.create({
                data: {
                    amount: order.total,
                    method: method as any,
                    status: PaymentStatus.COMPLETED,
                    b2bOrderId: orderId,
                },
            });
        }

        // Notify seller of payment
        try {
            const orderRef = order.orderNumber?.substring(0, 8)?.toUpperCase() || orderId.substring(0, 8).toUpperCase();
            await this.pusherService.trigger(
                `business-${order.sellerId}`,
                "b2b-payment-received",
                {
                    orderId,
                    orderRef,
                    amount: order.total,
                    buyerId: businessId,
                },
            );
        } catch (err) {
            this.logger.warn(`Failed to send B2B payment notification`, err);
        }

        return payment;
    }

    // ─── Phone-based B2B order lookup (for USSD) ───────────

    async getB2BOrdersByPhone(phone: string, role: "buyer" | "seller" | "all" = "buyer") {
        const client = this.prisma as any;

        const business = await client.business.findFirst({
            where: { phone },
            select: { id: true, name: true },
        });
        if (!business) return { items: [], total: 0, businessId: null, businessName: null };

        const where: any = {};
        if (role === "buyer") where.buyerId = business.id;
        else if (role === "seller") where.sellerId = business.id;
        else where.OR = [{ buyerId: business.id }, { sellerId: business.id }];

        const items = await client.b2BOrder.findMany({
            where,
            include: B2B_ORDER_INCLUDE,
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        return { items, total: items.length, businessId: business.id, businessName: business.name };
    }
}
