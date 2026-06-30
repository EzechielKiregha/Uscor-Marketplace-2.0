import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { lineTotal, sumPrecise } from "../common/token-math";
import { B2BPaymentTerms } from "../generated/prisma/enums";
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
        },
    },
};

@Injectable()
export class B2BService {
    private readonly logger = new Logger(B2BService.name);

    constructor(private prisma: PrismaService) {}

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

        return client.b2BOrder.create({
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
}
