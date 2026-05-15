import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { put } from "@vercel/blob";
import * as puppeteer from "puppeteer";
import { AuthPayload } from "../auth/entities/auth-payload.entity";
import { PaymentStatus } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { TokenTransactionType } from "../token-transaction/dto/create-token-transaction.input";
import { TokenTransactionService } from "../token-transaction/token-transaction.service";
import { CreateOrderInput } from "./dto/create-order.input";
import { GenerateOrderReceiptInput } from "./dto/receipt.input";
import { UpdateOrderInput } from "./dto/update-order.input";

// Service
@Injectable()
export class OrderService {
	private readonly logger = new Logger(OrderService.name);
	constructor(
		private prisma: PrismaService,
		private tokenTransactionService: TokenTransactionService,
		private configService: ConfigService,
	) {}

	async create(createOrderInput: CreateOrderInput) {
		const { clientId, orderProducts, payment, ...orderData } = createOrderInput;

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
				throw new Error(`Insufficient stock for product ${op.productId}`);
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
		const totalAmount = productTotal + (orderData.deliveryFee || 0);

		// if (payment.amount !== totalAmount) {
		//   throw new Error(`Payment amount (${payment.amount}) does not match total (${totalAmount})`);
		// }

		// Create order
		const order = await this.prisma.order.create({
			data: {
				...orderData,
				totalAmount,
				client: { connect: { id: clientId } },
				payment: {
					create: {
						amount: totalAmount,
						method: payment.method,
						status: payment.status || PaymentStatus.PENDING,
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
			},
		});

		// Update stock
		await Promise.all(
			order.products.map((op: { quantity: number; product: { id: string } }) =>
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
				const markup = reOwnedProduct.newPrice - reOwnedProduct.oldPrice;
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
			const repostedProduct = await this.prisma.repostedProduct.findFirst({
				where: { productId: op.product.id },
				select: {
					id: true,
					businessId: true,
				},
			});
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
						increment: order.products.reduce((sum, op) => sum + op.quantity, 0),
					},
				},
			});
		}

		// Transform the data to match frontend expectations
		return {
			...order,
			deliveryAddress: this.prisma.address.findUnique({
				where: { id: order?.deliveryAddress! },
			}),
			status: order.payment?.status || "PENDING",
			products: order.products?.map((op) => ({
				...op,
			})),
		};
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
			where: { id : order.id},
			data: { receiptUrl: blob.url}
		})

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
					return "Mobile Money";
				case "CASH":
					return "Cash";
				case "CARD":
					return "Card";
				case "TOKEN":
					return "USCOR Token";
				default:
					return method;
			}
		};

		const itemsHtml = order.products
			.map((item: any) => {
				const product = item.product || {};
				return `
					<tr>
						<td>${product.title || "Item"}</td>
						<td>${item.quantity}</td>
						<td>$${(product.price || 0).toFixed(2)}</td>
						<td>$${((product.price || 0) * item.quantity).toFixed(2)}</td>
					</tr>
				`;
			})
			.join("\n");

		const deliveryAddressLine = order.deliveryAddress
			? `${order.deliveryAddress.street || ""}, ${order.deliveryAddress.city || ""}${order.deliveryAddress.postalCode ? ", " + order.deliveryAddress.postalCode : ""}${order.deliveryAddress.country ? ", " + order.deliveryAddress.country : ""}`
			: "Not provided";

		const subtotal = order.products.reduce(
			(sum: number, item: any) =>
				sum + (item.product?.price || 0) * item.quantity,
			0,
		);
		const total = order.payment?.amount ?? subtotal + (order.deliveryFee || 0);

		return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Order Receipt ${order.id.substring(0, 8)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
    .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 18px; margin-bottom: 24px; }
    .header h1 { font-size: 24px; margin-bottom: 4px; }
    .header p { color: #6b7280; margin: 0; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; margin-bottom: 12px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .table th, .table td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .table th { background: #f9fafb; color: #374151; }
    .summary { width: 100%; margin-top: 16px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .summary-row strong { color: #111827; }
    .footer { padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Order Receipt</h1>
    <p>Order #: ${order.id}</p>
    <p>Date: ${new Date(order.createdAt).toLocaleDateString("en-US")}</p>
  </div>

  <div class="section">
    <h2>Client</h2>
    <p>${order.client?.fullName || "Customer"}</p>
    <p>${order.client?.email || ""}</p>
  </div>

  <div class="section">
    <h2>Delivery</h2>
    <p>${deliveryAddressLine}</p>
  </div>

  <div class="section">
    <h2>Payment</h2>
    <p>Method: ${formatPaymentMethod(order.payment?.method || "")}</p>
    <p>Status: ${order.payment?.status || "Pending"}</p>
  </div>

  <div class="section">
    <h2>Items</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  <div class="summary">
    <div class="summary-row"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>
    <div class="summary-row"><span>Delivery Fee</span><strong>$${(order.deliveryFee || 0).toFixed(2)}</strong></div>
    <div class="summary-row"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with us.</p>
  </div>
</body>
</html>`;
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
			},
		});

		if (!order) return null;

		// Transform the data to match frontend expectations
		return {
			...order,
			deliveryAddress: this.prisma.address.findUnique({
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
			},
		});

		// Transform the data to match frontend expectations
		return {
			...order,
			deliveryAddress: this.prisma.address.findUnique({
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
					startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
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
				where,
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
		const transformedOrders = orders.map((order) => ({
			...order,
			deliveryAddress: this.prisma.address.findUnique({
				where: { id: order?.deliveryAddress! },
			}),
			status: order.payment?.status || "PENDING",
			products: order.products?.map((op) => ({
				...op,
			})),
		}));

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
				where: { clientId },
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
				where: { clientId },
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
				firstProduct?.product?.business || (bizId ? businessMap[bizId] : null);
			const store = firstProduct?.product?.store || null;

			// items array expected by frontend
			const items = (order.products || []).map((op: any) => ({
				id: op.product?.id || op.id,
				name: op.product?.title || op.product?.name || "",
				price: op.product?.price || 0,
				quantity: op.quantity || 0,
				media: op.product?.medias?.map((m: any) => ({ url: m.url })),
			}));

			// deliveryAddress transformation: try JSON parse, fallback split
			// let deliveryAddress: any = null;
			// if (order.deliveryAddress) {
			// 	try {
			// 		const parsed = JSON.parse(order.deliveryAddress);
			// 		deliveryAddress = {
			// 			street: parsed.street || order.deliveryAddress,
			// 			city: parsed.city || null,
			// 		};
			// 	} catch (_e) {
			// 		const parts = (order.deliveryAddress || "").split(",");
			// 		deliveryAddress = {
			// 			street:
			// 				parts.slice(0, -1).join(",").trim() || order.deliveryAddress,
			// 			city: parts.slice(-1)[0]?.trim() || null,
			// 		};
			// 	}
			// }

			return {
				id: order.id,
				orderNumber: order.id,
				status: order.payment?.status || "PENDING",
				totalAmount: order.totalAmount,
				createdAt: order.createdAt,
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

		// Update payment status
		const updatedOrder = await this.prisma.order.update({
			where: { id: orderId },
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
			},
		});

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
