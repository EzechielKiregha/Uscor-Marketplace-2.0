import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { put } from "@vercel/blob";
import * as puppeteer from "puppeteer";
import QRCode from "qrcode";
import { UpdatePaymentTransactionInput } from "src/payment-transaction/dto/update-payment-transaction.input";
import { AuthPayload } from "../auth/entities/auth-payload.entity";
import { OrderStatus, PaymentStatus } from "../generated/prisma/enums";
import { PaymentTransactionService } from "../payment-transaction/payment-transaction.service";
import { PrismaService } from "../prisma/prisma.service";
import { TokenTransactionType } from "../token-transaction/dto/create-token-transaction.input";
import { TokenTransactionService } from "../token-transaction/token-transaction.service";
import { CreateOrderInput, CreateOrderProductInput } from "./dto/create-order.input";
import { GenerateOrderReceiptInput } from "./dto/receipt.input";
import { UpdateOrderInput } from "./dto/update-order.input";
import { OrderBusinessGroupEntity } from "./entities/order-business-group.entity";

// Service
@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);
    constructor(
        private prisma: PrismaService,
        private tokenTransactionService: TokenTransactionService,
        private paymentTransaction: PaymentTransactionService,
        private configService: ConfigService,
    ) {}

    private async earnPoints(order: any, half: "initial" | "remaining") {
        if (!order?.client?.id || !order?.products?.length) {
            return;
        }

        const businessTotals = order.products.reduce(
            (
                acc: Record<
                    string,
                    {
                        subtotal: number;
                        loyaltyProgramId?: string;
                        pointsPerPurchase?: number;
                    }
                >,
                item: any,
            ) => {
                const businessId = item.product?.businessId;
                const price = item.product?.price ?? 0;
                if (!businessId) return acc;

                if (!acc[businessId]) {
                    acc[businessId] = { subtotal: 0 };
                }
                acc[businessId].subtotal += price * item.quantity;
                return acc;
            },
            {},
        );

        const businessIds = Object.keys(businessTotals);
        if (!businessIds.length) {
            return;
        }

        const loyaltyPrograms = await this.prisma.loyaltyProgram.findMany({
            where: { businessId: { in: businessIds } },
        });

        const programByBusinessId = new Map(
            loyaltyPrograms.map((program) => [program.businessId, program]),
        );

        for (const businessId of businessIds) {
            const program = programByBusinessId.get(businessId);
            if (!program) continue;

            const subtotal = businessTotals[businessId].subtotal;
            const totalPoints = subtotal * (program.pointsPerPurchase ?? 0);
            const firstHalf = Math.floor(totalPoints / 2);
            const secondHalf = Math.ceil(totalPoints / 2);
            const pointsToCreate = half === "initial" ? firstHalf : secondHalf;

            if (pointsToCreate <= 0) {
                continue;
            }

            await this.prisma.pointsTransaction.create({
                data: {
                    clientId: order.client.id,
                    loyaltyProgramId: program.id,
                    points: pointsToCreate,
                    type: "EARNED",
                },
            });
        }
    }

    async create(createOrderInput: CreateOrderInput) {
        const {
            clientId,
            orderProducts,
            payment,
            clientOrderId,
            useUnifiedPayment,
            ...orderData
        } = createOrderInput;

        // Group items by business (from frontend logic)
        const businessGroups = clientOrderId ? this.groupItemsByBusiness(orderProducts) : []

        // Validate client
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new Error("Client not found");
        }

        // Validate products and stock
        for (const op of orderProducts) {
            const product = await this.prisma.product.findUnique({
                where: { id: op.productId },
                select: {
                    id: true,
                    quantity: true,
                    price: true,
                },
            });
            if (!product) {
                throw new Error(`Product ${op.productId} not found`);
            }
            if (product.quantity < op.quantity) {
                throw new Error(
                    `Insufficient stock for product ${op.productId}`,
                );
            }
        }

        // Calculate total amount
        const productTotal = (
            await Promise.all(
                orderProducts.map(async (op) => {
                    const product = await this.prisma.product.findUnique({
                        where: { id: op.productId },
                    });

                    if (!product) throw new Error("Product not found");

                    return product.price * op.quantity;
                }),
            )
        ).reduce((sum, val) => sum + val, 0);
        const totalAmount = productTotal;

        // if (payment.amount !== totalAmount) {
        //   throw new Error(`Payment amount (${payment.amount}) does not match total (${totalAmount})`);
        // }

        // Create order
        const order = await this.prisma.order.create({
            data: {
                ...orderData,
                totalAmount,
                client: { connect: { id: clientId } },
                clientOrderId: clientOrderId ?? undefined,
                payment: {
                    create: {
                        amount: totalAmount,
                        method: payment.method,
                        status: PaymentStatus.PENDING,
                        qrCode: payment.qrCode,
                    },
                },
                products: {
                    create: orderProducts.map((item) => ({
                        product: {
                            connect: { id: item.productId },
                        },
                        quantity: item.quantity,
                    })),
                },
            },
            select: {
                id: true,
                deliveryFee: true,
                deliveryAddress: true,
                qrCode: true,
                receiptUrl: true,
                createdAt: true,
                updatedAt: true,
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        createdAt: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionDate: true,
                        qrCode: true,
                        createdAt: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        quantity: true,
                        createdAt: true,
                        product: {
                            select: {
                                id: true,
                                businessId: true,
                                title: true,
                                price: true,
                                createdAt: true,
                                medias: {
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                businessGroups: {
        include: {
          business: true,
          items: {
            include: {
              product: {
                include: { medias: { take: 1 } },
              },
            },
          },
        },
      },
            },
        });

        // Create Business Groups + Items
        if (!clientOrderId) {
            for (const group of Object.values(businessGroups as OrderBusinessGroupEntity[])) {
                await this.prisma.orderBusinessGroup.create({
                    data: {
                        orderId: order.id,
                        businessId: group.businessId,
                        subtotal: group.subtotal,
                        deliveryFee: group.deliveryFee,
                        total: group.total,
                        items: {
                            create: group.items.map((item) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price || 0, // You should pass price
                            })),
                        },
                    },
                });
            }
        }

        // Update stock
        await Promise.all(
            order.products.map(
                (op: { quantity: number; product: { id: string } }) =>
                    this.prisma.product.update({
                        where: { id: op.product.id },
                        data: {
                            stock: { decrement: op.quantity },
                        },
                    }),
            ),
        );

        // Handle profit-sharing for re-owned products and commissions for reposted products
        for (const op of order.products) {
            // ReOwnedProduct profit-sharing
            const reOwnedProduct = await this.prisma.reOwnedProduct.findFirst({
                where: {
                    newProductId: op.product.id,
                },
                select: {
                    id: true,
                    oldOwnerId: true,
                    oldPrice: true,
                    newPrice: true,
                    quantity: true,
                },
            });
            if (reOwnedProduct) {
                const markup =
                    reOwnedProduct.newPrice - reOwnedProduct.oldPrice;
                if (markup > 0) {
                    const profitShare = markup * 0.2 * op.quantity; // 20% of markup per unit
                    await this.tokenTransactionService.create({
                        businessId: reOwnedProduct.oldOwnerId,
                        reOwnedProductId: reOwnedProduct.id,
                        amount: profitShare,
                        type: TokenTransactionType.PROFIT_SHARE,
                    });
                }
            }

            // RepostedProduct commission
            const repostedProduct = await this.prisma.repostedProduct.findFirst(
                {
                    where: { productId: op.product.id },
                    select: {
                        id: true,
                        businessId: true,
                    },
                },
            );
            if (repostedProduct) {
                const product = await this.prisma.product.findUnique({
                    where: { id: op.product.id },
                    select: { price: true },
                });

                if (!product) throw new Error("Product not found");

                const commission = product.price * 0.002 * op.quantity; // 0.02% commission per unit
                await this.tokenTransactionService.create({
                    businessId: repostedProduct.businessId,
                    repostedProductId: repostedProduct.id,
                    amount: commission,
                    type: TokenTransactionType.REPOST_COMMISSION,
                });
            }
        }

        // Update totalProductsSold for businesses
        const businessIds = [
            ...new Set(order.products.map((op) => op.product.businessId)),
        ];
        if (businessIds.length > 0) {
            await this.prisma.business.updateMany({
                where: { id: { in: businessIds } },
                data: {
                    totalProductsSold: {
                        increment: order.products.reduce(
                            (sum, op) => sum + op.quantity,
                            0,
                        ),
                    },
                },
            });
        }

        if (!clientOrderId) {
            await this.earnPoints(order, "initial");
        }

        // Transform the data to match frontend expectations
        return {
            ...order,
            deliveryAddress: await this.prisma.address.findUnique({
                where: { id: order?.deliveryAddress! },
            }),
            status: order.payment?.status || "PENDING",
            products: order.products?.map((op) => ({
                ...op,
            })),
        };
    }

    // Helper method
    private groupItemsByBusiness(orderProducts: CreateOrderProductInput[]) {
        // You can enhance this to fetch prices if needed
        return orderProducts.reduce((groups: any, item) => {
            const businessId = item.businessId! ;
            if (!groups[businessId]) {
                groups[businessId] = {
                    businessId,
                    items: [],
                    subtotal: 0,
                    deliveryFee: 5.0,
                    total: 5.0,
                };
            }
            groups[businessId].items.push(item);
            groups[businessId].subtotal += item.price! * item.quantity;
            groups[businessId].total =
                groups[businessId].subtotal + groups[businessId].deliveryFee;
            return groups;
        }, {});
    }

    // Get orders for a specific business
    async getBusinessOrders(businessId: string) {
    return this.prisma.orderBusinessGroup.findMany({
        where: { businessId },
        include: {
        order: {
            include: {
            client: true,
            payment: true,
            },
        },
        items: {
            include: {
            product: {
                include: { medias: { take: 1 } },
            },
            },
        },
        business: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    }

    // Get full order with business groups (for client)
    async findOneWithGroups(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
        client: true,
        payment: true,
        businessGroups: {
            include: {
            business: true,
            items: {
                include: {
                product: {
                    include: { medias: { take: 1 } },
                },
                },
            },
            },
        },
        },
    });

    if (!order) throw new Error("Order not found");

    // Security check
    if (order.clientId !== userId) {
        throw new Error("Not authorized");
    }

    return order;
    }

    async generateReceipt(input: GenerateOrderReceiptInput, user: AuthPayload) {
        const { orderId, email } = input;

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionDate: true,
                        qrCode: true,
                        createdAt: true,
                    },
                },
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                businessId: true,
                                title: true,
                                price: true,
                                medias: {
                                    select: { url: true },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new Error("Order not found");
        }

        const qrData =
            "https://uscor-marketplace-2-0-front-ui.vercel.app/order-status?id=" +
                order.id || "";
        const qrBase64 = await QRCode.toDataURL(qrData);

        if (order.clientId !== user.id) {
            throw new Error(
                "Clients can only generate receipts for their own orders",
            );
        }

        const deliveryAddress = order.deliveryAddress
            ? await this.prisma.address.findUnique({
                  where: { id: order.deliveryAddress },
              })
            : null;

        const html = this.generateOrderReceiptHTML({
            ...order,
            deliveryAddress,
            qrBase64,
        });

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                bottom: "20px",
                left: "20px",
                right: "20px",
            },
        });

        await browser.close();

        const fileName = `order_receipt_${order.id.substring(0, 8)}_${Date.now()}.pdf`;
        const blobToken = this.configService.get<string>(
            "NEST_PUBLIC_BLOB_READ_WRITE_TOKEN",
        );
        if (!blobToken) {
            this.logger.error(
                "NEST_PUBLIC_BLOB_READ_WRITE_TOKEN is missing in environment variables.",
            );
            throw new Error(
                "Receipt upload configuration error. Please contact support.",
            );
        }

        const blob = await put(
            `order-receipts/${fileName}`,
            Buffer.from(pdfBuffer),
            {
                access: "public",
                contentType: "application/pdf",
                token: blobToken,
            },
        );

        const businessId = order.products?.[0]?.product?.businessId;
        const mediaRecord = await this.prisma.media.create({
            data: {
                url: blob.url,
                type: "DOCUMENT",
                size: BigInt(pdfBuffer.length),
                pathname: blob.pathname,
                clientId: order.clientId,
                businessId,
            },
        });

        await this.prisma.order.update({
            where: { id: order.id },
            data: { receiptUrl: blob.url },
        });

        let emailSent = false;
        if (email && order.client?.email) {
            try {
                console.log(
                    `Simulated sending order receipt email to ${email} with URL: ${blob.url}`,
                );
                emailSent = true;
            } catch (emailError) {
                this.logger.error(
                    `Failed to send order receipt email to ${email}`,
                    emailError,
                );
                emailSent = false;
            }
        }

        return {
            receiptUrl: blob.url,
            fileName,
            mediaId: mediaRecord.id,
            emailSent,
        };
    }

    private generateOrderReceiptHTML(order: any): string {
        const formatPaymentMethod = (method: string) => {
            switch (method) {
                case "MOBILE_MONEY":
                    return "📱 Mobile Money";
                case "CASH":
                    return "💵 Cash";
                case "CARD":
                    return "💳 Card";
                case "TOKEN":
                    return "🪙 USCOR Token";
                default:
                    return method;
            }
        };

        const formatOrderStatus = (status: string) => {
            switch (status) {
                case "PENDING":
                    return "🕒 Pending";
                case "PROCESSING":
                    return "⚙️ Processing";
                case "SHIPPED":
                    return "🚚 Shipped";
                case "DELIVERED":
                    return "✅ Delivered";
                case "CANCELLED":
                    return "❌ Cancelled";
                default:
                    return status || "Pending";
            }
        };

        const itemsHtml = order.products
            .map((item: any) => {
                const product = item.product || {};

                return `
					<div class="item-row">
						<div class="item-details">
							<div class="item-name">${product.title || "Item"}</div>
							<div class="item-meta">
								Qty: ${item.quantity} × $${(product.price || 0).toFixed(2)}
							</div>
						</div>

						<div class="item-price">
							$${((product.price || 0) * item.quantity).toFixed(2)}
						</div>
					</div>
				`;
            })
            .join("");

        const deliveryAddressLine = order.deliveryAddress
            ? `${order.deliveryAddress.street || ""}, ${
                  order.deliveryAddress.city || ""
              }${
                  order.deliveryAddress.postalCode
                      ? ", " + order.deliveryAddress.postalCode
                      : ""
              }${
                  order.deliveryAddress.country
                      ? ", " + order.deliveryAddress.country
                      : ""
              }`
            : "Not provided";

        const subtotal = order.products.reduce(
            (sum: number, item: any) =>
                sum + (item.product?.price || 0) * item.quantity,
            0,
        );

        const deliveryFee = order.deliveryFee || 0;
        const tax = subtotal * 0.18;

        const total = order.payment?.amount ?? subtotal + deliveryFee + tax;

        return `
	<!DOCTYPE html>
	<html>
	<head>
	<meta charset="utf-8">
	<title>Order Receipt - ${order.id.substring(0, 8)}</title>

	<style>
		* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		}

		body {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
			Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

		background: #f3f4f6;
		color: #111827;
		padding: 20px;
		}

		.receipt-container {
		max-width: 420px;
		margin: 0 auto;
		background: #ffffff;
		border-radius: 14px;
		overflow: hidden;
		border: 1px solid #e5e7eb;
		box-shadow: 0 10px 30px rgba(0,0,0,0.06);
		}

		/* HEADER */

		.receipt-header {
		background: linear-gradient(135deg, #f97316, #ea580c);
		padding: 24px 20px;
		color: white;
		text-align: center;
		position: relative;
		}

		.brand-logo {
		width: 68px;
		height: 68px;
		border-radius: 999px;
		background: rgba(255,255,255,0.18);

		display: flex;
		align-items: center;
		justify-content: center;

		margin: 0 auto 14px;
		font-size: 30px;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255,255,255,0.25);
		}

		.brand-name {
		font-size: 22px;
		font-weight: 700;
		letter-spacing: 0.3px;
		}

		.receipt-title {
		margin-top: 10px;
		font-size: 14px;
		font-weight: 500;
		opacity: 0.92;
		letter-spacing: 1px;
		}

		.order-badge {
		margin-top: 14px;
		display: inline-flex;
		align-items: center;
		gap: 6px;

		padding: 8px 14px;
		border-radius: 999px;

		background: rgba(255,255,255,0.15);
		border: 1px solid rgba(255,255,255,0.2);

		font-size: 13px;
		font-weight: 600;
		}

		/* META */

		.receipt-meta {
		background: #f9fafb;
		padding: 18px 20px;
		border-bottom: 1px solid #e5e7eb;
		}

		.meta-item {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
		font-size: 14px;
		}

		.meta-item:last-child {
		margin-bottom: 0;
		}

		.meta-label {
		color: #6b7280;
		font-weight: 500;
		}

		.meta-value {
		color: #111827;
		font-weight: 600;
		text-align: right;
		}

		/* SECTIONS */

		.section {
		padding: 20px;
		border-bottom: 1px solid #f3f4f6;
		}

		.section-title {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		color: #374151;
		margin-bottom: 14px;
		}

		/* DELIVERY */

		.delivery-card {
		background: #fff7ed;
		border: 1px solid #fed7aa;
		border-radius: 12px;
		padding: 14px;
		}

		.delivery-address {
		font-size: 14px;
		line-height: 1.6;
		color: #374151;
		}

		/* ITEMS */

		.items-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
		}

		.item-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 14px;
		padding-bottom: 14px;
		border-bottom: 1px dashed #e5e7eb;
		}

		.item-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
		}

		.item-details {
		flex: 1;
		}

		.item-name {
		font-size: 14px;
		font-weight: 600;
		color: #111827;
		margin-bottom: 4px;
		}

		.item-meta {
		font-size: 12px;
		color: #6b7280;
		}

		.item-price {
		font-size: 14px;
		font-weight: 700;
		color: #f97316;
		white-space: nowrap;
		}

		/* TOTALS */

		.totals-section {
		padding: 20px;
		background: #fcfcfc;
		}

		.total-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 12px;
		font-size: 14px;
		}

		.total-label {
		color: #6b7280;
		}

		.total-value {
		font-weight: 600;
		color: #111827;
		}

		.grand-total {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 2px solid #e5e7eb;
		}

		.grand-total .total-label {
		font-size: 16px;
		font-weight: 700;
		color: #111827;
		}

		.grand-total .total-value {
		font-size: 20px;
		font-weight: 800;
		color: #f97316;
		}

		/* PAYMENT */

		.payment-card {
		background: #f9fafb;
		border-radius: 12px;
		padding: 14px;
		border: 1px solid #e5e7eb;
		}

		.payment-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
		font-size: 14px;
		}

		.payment-row:last-child {
		margin-bottom: 0;
		}

		/* FOOTER */

		.footer {
		text-align: center;
		padding: 24px 20px;
		background: #f9fafb;
		}

		.footer-logo {
		font-size: 22px;
		margin-bottom: 10px;
		color: #f97316;
		font-weight: 700;
		}

		.footer-text {
		font-size: 13px;
		color: #6b7280;
		line-height: 1.7;
		}

		.thank-you {
		color: #111827;
		font-weight: 600;
		margin-bottom: 8px;
		}

		.qr-placeholder {
		width: 90px;
		height: 90px;
		background: #e5e7eb;
		border-radius: 10px;

		display: flex;
		align-items: center;
		justify-content: center;

		margin: 18px auto 8px;
		color: #9ca3af;
		font-size: 12px;
		font-weight: 600;
		}

		@media print {
		body {
			background: white;
			padding: 0;
		}

		.receipt-container {
			box-shadow: none;
			border: none;
		}
		}
	</style>
	</head>

	<body>
	<div class="receipt-container">

		<!-- HEADER -->
		<div class="receipt-header">

		<div class="brand-logo">
			📦
		</div>

		<div class="brand-name">
			Uscor Marketplace
		</div>

		<div class="receipt-title">
			ORDER RECEIPT #${order.id.substring(0, 8)}
		</div>

		<div class="order-badge">
			${formatOrderStatus(order.status)}
		</div>
		</div>

		<!-- META -->
		<div class="receipt-meta">

		<div class="meta-item">
			<span class="meta-label">Customer</span>
			<span class="meta-value">
			${order.client?.fullName || "Customer"}
			</span>
		</div>

		${
            order.client?.email
                ? `
		<div class="meta-item">
			<span class="meta-label">Email</span>
			<span class="meta-value">
			${order.client.email}
			</span>
		</div>
		`
                : ""
        }

		<div class="meta-item">
			<span class="meta-label">Date</span>
			<span class="meta-value">
			${new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })}
			</span>
		</div>

		<div class="meta-item">
			<span class="meta-label">Order ID</span>
			<span class="meta-value">
			${order.id.substring(0, 12)}
			</span>
		</div>
		</div>

		<!-- DELIVERY -->
		<div class="section">

		<div class="section-title">
			Delivery Address
		</div>

		<div class="delivery-card">
			<div class="delivery-address">
			${deliveryAddressLine}
			</div>
		</div>
		</div>

		<!-- ITEMS -->
		<div class="section">

		<div class="section-title">
			Ordered Items
		</div>

		<div class="items-list">
			${itemsHtml}
		</div>
		</div>

		<!-- PAYMENT -->
		<div class="section">

		<div class="section-title">
			Payment Information
		</div>

		<div class="payment-card">

			<div class="payment-row">
			<span>Method</span>
			<strong>
				${formatPaymentMethod(order.payment?.method || "")}
			</strong>
			</div>

			<div class="payment-row">
			<span>Status</span>
			<strong>
				${order.payment?.status || "Pending"}
			</strong>
			</div>

		</div>
		</div>

		<!-- TOTALS -->
		<div class="totals-section">

		<div class="total-row">
			<span class="total-label">Subtotal</span>
			<span class="total-value">
			$${subtotal.toFixed(2)}
			</span>
		</div>

		<div class="total-row">
			<span class="total-label">Tax (18%)</span>
			<span class="total-value">
			$${tax.toFixed(2)}
			</span>
		</div>

		<div class="total-row">
			<span class="total-label">Delivery Fee</span>
			<span class="total-value">
			$${deliveryFee.toFixed(2)}
			</span>
		</div>

		<div class="total-row grand-total">
			<span class="total-label">TOTAL</span>
			<span class="total-value">
			$${total.toFixed(2)}
			</span>
		</div>
		</div>

		<!-- FOOTER -->
		<div class="footer">

		<div class="footer-logo">
			Uscor Marketplace
		</div>

		<div class="thank-you">
			Thank you for your order!
		</div>

		<div class="footer-text">
			Your satisfaction is our priority.<br />
			www.uscor.rw<br />
			+250 790 802 201
		</div>

		<div class="qr-placeholder">
			<img src="${order.qrBase64}" width="120" />
		</div>

		<div class="footer-text">
			Scan for order tracking
		</div>
		</div>
	</div>
	</body>
	</html>
		`;
    }

    async findAll() {
        const orders = await this.prisma.order.findMany({
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        createdAt: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionDate: true,
                        qrCode: true,
                        createdAt: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        quantity: true,
                        createdAt: true,
                        product: {
                            select: {
                                id: true,
                                businessId: true,
                                title: true,
                                price: true,
                                createdAt: true,
                                medias: {
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                businessGroups: {
                    include: {
                        business: true,
                        items: {
                            include: {
                            product: {
                                include: { medias: { take: 1 } },
                            },
                            },
                        },
                    },
                },
            },
        });

        // Transform the data to match frontend expectations
        return orders.map((order) => ({
            ...order,
            status: order.payment?.status || "PENDING",
            products: order.products?.map((op) => ({
                ...op,
            })),
        }));
    }

    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        createdAt: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionDate: true,
                        qrCode: true,
                        createdAt: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        quantity: true,
                        createdAt: true,
                        product: {
                            select: {
                                id: true,
                                businessId: true,
                                title: true,
                                price: true,
                                createdAt: true,
                                medias: {
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                businessGroups: {
                    include: {
                    business: true,
                    items: {
                        include: {
                        product: {
                            include: { medias: { take: 1 } },
                        },
                        },
                    },
                    },
                },
            },
        });

        if (!order) return null;

        // Transform the data to match frontend expectations
        return {
            ...order,
            deliveryAddress: await this.prisma.address.findUnique({
                where: { id: order?.deliveryAddress! },
            }),
            status: order.payment?.status || "PENDING",
            products: order.products?.map((op) => ({
                ...op,
            })),
        };
    }

    async update(id: string, updateOrderInput: UpdateOrderInput) {
        const { ...orderData } = updateOrderInput;
        const order = await this.prisma.order.update({
            where: { id },
            data: {
                deliveryAddress: orderData.deliveryAddress,
                qrCode: orderData.qrCode,
                deliveryFee: orderData.deliveryFee,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        createdAt: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionDate: true,
                        qrCode: true,
                        createdAt: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        quantity: true,
                        createdAt: true,
                        product: {
                            select: {
                                id: true,
                                businessId: true,
                                title: true,
                                price: true,
                                createdAt: true,
                                medias: {
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                businessGroups: {
        include: {
          business: true,
          items: {
            include: {
              product: {
                include: { medias: { take: 1 } },
              },
            },
          },
        },
      },
            },
        });

        // Transform the data to match frontend expectations
        return {
            ...order,
            deliveryAddress: await this.prisma.address.findUnique({
                where: { id: order?.deliveryAddress! },
            }),
            status: order.payment?.status || "PENDING",
            products: order.products?.map((op) => ({
                ...op,
            })),
        };
    }

    async remove(id: string) {
        return this.prisma.order.delete({
            where: { id },
            select: {
                id: true,
                deliveryFee: true,
            },
        });
    }
    async cancelOrder(id: string) {
        return this.prisma.order.update({
            where: { id },
            select: {
                id: true,
                status: true,
            },
            data: { status: OrderStatus.CANCELLED, 
                payment: { update : {
                    status: PaymentStatus.FAILED
                } }
             }
        });
    }

    async findBusinessOrders(
        businessId: string,
        page: number = 1,
        limit: number = 20,
        search?: string,
        status?: string,
        date?: string,
    ) {
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            products: {
                some: {
                    product: {
                        businessId: businessId,
                    },
                },
            },
        };

        // Add search filter
        if (search) {
            where.OR = [
                {
                    client: {
                        fullName: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    id: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Add status filter
        if (status) {
            where.payment = {
                status: status,
            };
        }

        // Add date filter
        if (date) {
            const now = new Date();
            let startDate: Date;
            const endDate: Date = now;

            switch (date) {
                case "TODAY":
                    startDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate(),
                    );
                    break;
                case "THIS_WEEK": {
                    const dayOfWeek = now.getDay();
                    startDate = new Date(
                        now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000,
                    );
                    startDate.setHours(0, 0, 0, 0);
                    break;
                }
                case "THIS_MONTH":
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case "THIS_YEAR":
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(0);
            }

            where.createdAt = {
                gte: startDate,
                lte: endDate,
            };
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where : { 
                    ...where,
                    clientOrderId: {
                        not : null
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { 
                    client: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            createdAt: true,
                        },
                    },
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            method: true,
                            status: true,
                            transactionDate: true,
                            qrCode: true,
                            createdAt: true,
                        },
                    },
                    products: {
                        select: {
                            id: true,
                            quantity: true,
                            createdAt: true,
                            product: {
                                select: {
                                    id: true,
                                    businessId: true,
                                    title: true,
                                    price: true,
                                    createdAt: true,
                                    medias: {
                                        select: {
                                            url: true,
                                        },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        // Transform the data to match frontend expectations
        const transformedOrders = await Promise.all( 
            orders.map(async (order) => ({
                ...order,
                deliveryAddress: await this.prisma.address.findUnique({
                    where: { id: order?.deliveryAddress! },
                }),
                status: order.payment?.status || "PENDING",
                products: order.products?.map((op) => ({
                    ...op,
                })),
            }))
        )

        return {
            items: transformedOrders,
            total,
            page,
            limit,
        };
    }

    async findClientOrders(
        clientId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { clientId, clientOrderId: null },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    client: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            createdAt: true,
                        },
                    },
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            method: true,
                            status: true,
                            transactionDate: true,
                            qrCode: true,
                            createdAt: true,
                        },
                    },
                    products: {
                        select: {
                            id: true,
                            quantity: true,
                            createdAt: true,
                            product: {
                                select: {
                                    id: true,
                                    businessId: true,
                                    title: true,
                                    price: true,
                                    createdAt: true,
                                    medias: {
                                        select: {
                                            url: true,
                                        },
                                        take: 1,
                                    },
                                    business: {
                                        select: {
                                            id: true,
                                            name: true,
                                            avatar: true,
                                            isB2BEnabled: true,
                                            isVerified: true,
                                            businessType: true,
                                        },
                                    },
                                    store: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.order.count({
                where: { clientId, clientOrderId: undefined },
            }),
        ]);

        // Build business map from product businessIds
        const businessIds = new Set<string>();
        for (const o of orders) {
            for (const op of o.products || []) {
                const bId = op.product?.businessId || op.product?.business?.id;
                if (bId) businessIds.add(bId);
            }
        }
        const businesses = businessIds.size
            ? await this.prisma.business.findMany({
                  where: {
                      id: {
                          in: Array.from(businessIds),
                      },
                  },
                  select: {
                      id: true,
                      name: true,
                      avatar: true,
                  },
              })
            : [];
        const businessMap: Record<string, any> = {};
        for (const b of businesses) businessMap[b.id] = b;

        const transformedOrders = orders.map((order) => {
            const firstProduct = order.products?.find((p: any) => !!p.product);
            const bizId = firstProduct?.product?.businessId;
            const business =
                firstProduct?.product?.business ||
                (bizId ? businessMap[bizId] : null);
            const store = firstProduct?.product?.store || null;

            // items array expected by frontend
            const items = (order.products || []).map((op: any) => ({
                id: op.product?.id || op.id,
                name: op.product?.title || op.product?.name || "",
                price: op.product?.price || 0,
                quantity: op.quantity || 0,
                media: op.product?.medias?.map((m: any) => ({ url: m.url })),
            }));

            return {
                id: order.id,
                orderNumber: order.id.substring(0, 8).toUpperCase(),
                status: order.payment?.status || "PENDING",
                totalAmount: order.totalAmount,
                createdAt: order.createdAt,
                receiptUrl: order.receiptUrl || null,
                clientOrderId: order.clientOrderId || null,
                items,
                business,
                store,
                paymentMethod: order.payment
                    ? {
                          type: order.payment.method,
                          last4: null,
                      }
                    : null,
                deliveryAddress: this.prisma.address.findUnique({
                    where: { id: order?.deliveryAddress! },
                }),
            };
        });

        return {
            items: transformedOrders,
            total,
            page,
            limit,
        };
    }

    async processPayment(orderId: string, input: any) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!order) {
            throw new Error("Order not found");
        }

        if (!order.payment) {
            throw new Error("No payment found for this order");
        }

        const paymentInput: UpdatePaymentTransactionInput = {
            qrCode: order.qrCode || "No QRCode",
            status: PaymentStatus.COMPLETED,
        };

        await this.paymentTransaction.update(
            paymentInput,
            order.payment.id,
            order.clientId,
        );

        // Update payment status
        const updatedOrder = await this.prisma.order.update({
            where: { id: order.id },
            data: {
                payment: {
                    update: {
                        status: input.status || "COMPLETED",
                        transactionDate: new Date(),
                    },
                },
            },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        createdAt: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionDate: true,
                        qrCode: true,
                        createdAt: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        quantity: true,
                        createdAt: true,
                        product: {
                            select: {
                                id: true,
                                businessId: true,
                                title: true,
                                price: true,
                                createdAt: true,
                                medias: {
                                    select: {
                                        url: true,
                                    },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                businessGroups: {
        include: {
          business: true,
          items: {
            include: {
              product: {
                include: { medias: { take: 1 } },
              },
            },
          },
        },
      },
            },
        });

        await this.earnPoints(updatedOrder, "remaining");

        // Transform the data to match frontend expectations
        return {
            ...updatedOrder,
            status: updatedOrder.payment?.status || "PENDING",
            products: updatedOrder.products?.map((op) => ({
                ...op,
            })),
        };
    }
}
