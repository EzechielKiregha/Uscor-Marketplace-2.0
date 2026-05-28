import { Injectable } from "@nestjs/common";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import {
	Country,
	RechargeMethod,
} from "../account-recharge/dto/create-account-recharge.input";
import { BusinessService } from "../business/business.service";
import { ClientService } from "../client/client.service";
import { PaymentMethod, PaymentStatus } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentTransactionInput } from "./dto/create-payment-transaction.input";
import { UpdatePaymentTransactionInput } from "./dto/update-payment-transaction.input";

// Service
@Injectable()
export class PaymentTransactionService {
	constructor(
		private prisma: PrismaService,
		private accountRechargeService: AccountRechargeService,
		private readonly businessService: BusinessService,
		private readonly clientService: ClientService,
	) {}

	async validateTokenBalance(
		clientId: string,
		amount: number,
		method: RechargeMethod,
	): Promise<boolean> {
		let mtd;

		switch (method) {
			case RechargeMethod.MTN_MONEY:
				mtd = RechargeMethod.MTN_MONEY;
				break;
			case RechargeMethod.AIRTEL_MONEY:
				mtd = RechargeMethod.AIRTEL_MONEY;
				break;
			case RechargeMethod.MPESA:
				mtd = RechargeMethod.MPESA;
				break;
			case RechargeMethod.ORANGE_MONEY:
				mtd = RechargeMethod.ORANGE_MONEY;
				break;
			case RechargeMethod.TOKEN:
				mtd = RechargeMethod.TOKEN;
				break;
			default:
				throw new Error("Invalid recharge method");
		}

		const balance = await this.accountRechargeService.getBalance(
			clientId,
			"client",
			mtd,
		);
		return balance.totalAmount / 10 >= amount;
	}

	async create(
		createPaymentTransactionInput: CreatePaymentTransactionInput,
		clientId: string,
	) {
		const { orderId, method, amount, ...data } = createPaymentTransactionInput;

		// Check if PaymentTransaction already exists for the order
		const existingTransaction = await this.prisma.paymentTransaction.findUnique(
			{
				where: { orderId },
			},
		);
		if (existingTransaction) {
			throw new Error(
				"Payment transaction already initialized for this order. Use update instead.",
			);
		}

		// Ensure order belongs to client
		const order = await this.prisma.order.findUnique({
			where: { id: orderId },
			select: { clientId: true },
		});

		if (!order || order.clientId !== clientId) {
			throw new Error("Clients can only create payments for their own orders");
		}

		// Validate token balance for TOKEN method
		if (method === PaymentMethod.TOKEN) {
			const hasEnoughTokens = await this.validateTokenBalance(
				clientId,
				amount || 0,
				RechargeMethod.TOKEN,
			);
			if (!hasEnoughTokens) {
				throw new Error("Insufficient token balance");
			}
		}

		return this.prisma.paymentTransaction.create({
			data: {
				...data,
				amount: amount || 0,
				method,
				order: { connect: { id: orderId } },
			},
			select: {
				id: true,
				amount: true,
				method: true,
				status: true,
				transactionDate: true,
				qrCode: true,
				createdAt: true,
				order: {
					select: {
						id: true,
						deliveryFee: true,
						deliveryAddress: true,
						createdAt: true,
					},
				},
				postTransactions: {
					select: {
						id: true,
						amount: true,
						status: true,
						createdAt: true,
					},
				},
			},
		});
	}

	async update(
		updatePaymentTransactionInput: UpdatePaymentTransactionInput,
		id?: string,
		userId?: string,
		phone?: string,
	) {
		this.clientService.findByPhone(phone || "").then((client) => {
			if (client) {
				userId = client.id;
			}
		});

		this.businessService.findOneByPhone(phone || "").then((business) => {
			if (business) {
				userId = business.id;
			}
		});

		const latestTransaction = await this.findLatest(phone!);
		if (latestTransaction) {
			id = latestTransaction.id;
		}

		const { status, qrCode } = updatePaymentTransactionInput;
		const transaction = await this.findOne(id!);
		if (!transaction) {
			throw new Error("Payment transaction not found");
		}

		// Check ownership/authorization
		const order = await this.prisma.order.findUnique({
			where: { id: transaction?.orderId! },
			select: {
				clientId: true,
				payment: true,
				products: {
					select: {
						product: {
							select: { businessId: true },
						},
					},
				},
			},
		});

		if (!order) throw new Error("Order not found");

		const isBusinessOwner = order.products.some(
			(item) => item.product.businessId === userId,
		);

		if (!isBusinessOwner && order.clientId !== userId) {
			throw new Error(
				"You are not authorized to update this payment transaction",
			);
		}

		if (!order.payment)
			throw new Error("This order's payment was not initialized");

		// If status is changing to COMPLETED, validate and deduct balance
		if (
			status === "COMPLETED" &&
			transaction.status !== PaymentStatus.COMPLETED
		) {
			if (transaction.method === PaymentMethod.TOKEN) {
				const hasEnoughTokens = await this.validateTokenBalance(
					order.clientId,
					transaction.amount,
					RechargeMethod.TOKEN,
				);
				if (!hasEnoughTokens) {
					throw new Error("Insufficient token balance");
				}
				// Deduct balance by creating a negative AccountRecharge
				await this.accountRechargeService.create(
					{
						amount: -transaction.amount,
						method: RechargeMethod.TOKEN,
						origin: Country.DRC,
						clientId: order.clientId,
						businessId: undefined,
					},
					order.clientId,
					"client",
				);
			} else if (transaction.method === PaymentMethod.MOBILE_MONEY) {
				let mtd = RechargeMethod.AIRTEL_MONEY;
				let hasEnoughBalance = await this.validateTokenBalance(
					order.clientId,
					transaction.amount,
					mtd,
				);

				if (!hasEnoughBalance) {
					mtd = RechargeMethod.MTN_MONEY;
					hasEnoughBalance = await this.validateTokenBalance(
						order.clientId,
						transaction.amount,
						mtd,
					);
					if (!hasEnoughBalance) {
						mtd = RechargeMethod.ORANGE_MONEY;
						hasEnoughBalance = await this.validateTokenBalance(
							order.clientId,
							transaction.amount,
							mtd,
						);
						if (!hasEnoughBalance) {
							mtd = RechargeMethod.MPESA;
							hasEnoughBalance = await this.validateTokenBalance(
								order.clientId,
								transaction.amount,
								mtd,
							);
						}
					}
				}

				if (!hasEnoughBalance) {
					throw new Error("Insufficient mobile money balance");
				}

				// Deduct balance by creating a negative AccountRecharge
				await this.accountRechargeService.create(
					{
						amount: -transaction.amount,
						method: mtd,
						origin: Country.DRC,
						clientId: order.clientId,
						businessId: undefined,
					},
					order.clientId,
					"client",
				);
			}
		}

		return this.prisma.paymentTransaction.update({
			where: { id },
			data: {
				...(status && { status: status as any }),
				...(qrCode && { qrCode }),
			},
			select: {
				id: true,
				amount: true,
				method: true,
				status: true,
				transactionDate: true,
				qrCode: true,
				createdAt: true,
				order: {
					select: { id: true, deliveryFee: true },
				},
			},
		});
	}

	async findOne(id: string) {
		return this.prisma.paymentTransaction.findUnique({
			where: { id },
			include: {
				order: {
					select: {
						id: true,
						deliveryFee: true,
						deliveryAddress: true,
						createdAt: true,
					},
				},
				postTransactions: {
					orderBy: { createdAt: "desc" },
					take: 1,
					select: {
						id: true,
						amount: true,
						status: true,
						createdAt: true,
					},
				},
			},
		});
	}

	async findAllByUser(userId: string, role: string) {
		const where: any = {};
		if (role === "client") {
			where.order = { clientId: userId };
		} else if (role === "business") {
			where.order = {
				products: {
					some: {
						product: { businessId: userId },
					},
				},
			};
		} else {
			throw new Error("Unauthorized role");
		}

		const items = await this.prisma.paymentTransaction.findMany({
			where,
			include: {
				order: {
					select: {
						id: true,
						deliveryFee: true,
						deliveryAddress: true,
						createdAt: true,
					},
				},
				postTransactions: {
					orderBy: { createdAt: "desc" },
					take: 1,
					select: {
						id: true,
						amount: true,
						status: true,
						createdAt: true,
					},
				},
			},
		});

		return items.map((t: any) => ({
			...t,
			postTransaction: t.postTransactions?.[0] ?? null,
		}));
	}

	async findLatest(phone: string, userId?: string, role?: string) {
		this.clientService.findByPhone(phone || "").then((client) => {
			if (client) {
				userId = client.id;
				role = "client";
			}
		});

		this.businessService.findOneByPhone(phone || "").then((business) => {
			if (business) {
				userId = business.id;
				role = "business";
			}
		});

		const where: any = {
			status: PaymentStatus.PENDING,
		};
		if (role === "client") {
			where.order = { clientId: userId };
		} else if (role === "business") {
			where.order = {
				products: {
					some: {
						product: { businessId: userId },
					},
				},
			};
		} else {
			throw new Error("Unauthorized role");
		}

		const transaction = await this.prisma.paymentTransaction.findFirst({
			where,
			orderBy: { createdAt: "desc" },
			include: {
				order: {
					select: {
						id: true,
						deliveryFee: true,
						deliveryAddress: true,
						createdAt: true,
					},
				},
				postTransactions: {
					orderBy: { createdAt: "desc" },
					take: 1,
					select: {
						id: true,
						amount: true,
						status: true,
						createdAt: true,
					},
				},
			},
		});

		if (!transaction) return null;

		return {
			...transaction,
			postTransaction: transaction.postTransactions?.[0] ?? null,
		};
	}

	async findOneByUser(id: string, userId: string, role: string) {
		const transaction = await this.prisma.paymentTransaction.findUnique({
			where: { id },
			include: {
				order: {
					include: {
						products: {
							include: {
								product: true,
							},
						},
					},
				},
				postTransactions: {
					orderBy: { createdAt: "desc" },
					take: 1,
					select: {
						id: true,
						amount: true,
						status: true,
						createdAt: true,
					},
				},
			},
		});

		if (!transaction) {
			throw new Error("Payment transaction not found");
		}

		if (role === "client") {
			if (transaction.order?.clientId !== userId) {
				throw new Error(
					"Clients can only access their own payment transactions",
				);
			}
		} else if (role === "business") {
			const isAuthorized = transaction.order?.products.some(
				(item) => item.product.businessId === userId,
			);
			if (!isAuthorized) {
				throw new Error(
					"Businesses can only access transactions for their products",
				);
			}
		}

		return {
			...transaction,
			postTransaction: transaction.postTransactions?.[0] ?? null,
		};
	}

	async removeByUser(id: string, userId: string) {
		const transaction = await this.findOne(id);
		if (!transaction) {
			throw new Error("Payment transaction not found");
		}

		const order = await this.prisma.order.findUnique({
			where: { id: transaction?.orderId! },
			select: { clientId: true },
		});

		if (!order || order.clientId !== userId) {
			throw new Error("Clients can only delete their own payment transactions");
		}

		return this.prisma.paymentTransaction.delete({
			where: { id },
			select: { id: true, amount: true },
		});
	}
}
