import { Injectable } from "@nestjs/common";
import { sumPrecise } from "../common/token-math";
import { PaymentStatus, RechargeMethod } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountRechargeInput } from "./dto/create-account-recharge.input";
import { UpdateAccountRechargeInput } from "./dto/update-account-recharge.input";

// Service
@Injectable()
export class AccountRechargeService {
	constructor(private prisma: PrismaService) {}

	async create(
		createAccountRechargeInput: CreateAccountRechargeInput,
		userId: string,
		userRole: string,
	) {
		const { clientId, businessId, tokenTransactionId, ...data } =
			createAccountRechargeInput;

		// Validate that only one of clientId or businessId is provided
		if (clientId && businessId) {
			throw new Error("Only one of clientId or businessId should be provided");
		}
		if (!clientId && !businessId) {
			throw new Error("Either clientId or businessId must be provided");
		}

		// Ensure user is recharging their own account
		if (userRole === "client" && clientId !== userId) {
			throw new Error("Clients can only recharge their own account");
		}
		if (userRole === "business" && businessId !== userId) {
			throw new Error("Businesses can only recharge their own account");
		}

		// Validate tokenTransactionId if provided
		if (tokenTransactionId) {
			const tokenTransaction = await this.prisma.tokenTransaction.findUnique({
				where: { id: tokenTransactionId },
			});
			if (!tokenTransaction) {
				throw new Error("TokenTransaction not found");
			}
			if (
				tokenTransaction.isRedeemed !== true ||
				tokenTransaction.isReleased !== true
			) {
				throw new Error("TokenTransaction must be both redeemed and released");
			}
		}

		return this.prisma.accountRecharge.create({
			data: {
				...data,
				client: clientId ? { connect: { id: clientId } } : undefined,
				business: businessId ? { connect: { id: businessId } } : undefined,
				tokenTransaction: tokenTransactionId
					? {
							connect: { id: tokenTransactionId },
						}
					: undefined,
			},
			include: {
				client: clientId
					? {
							select: {
								id: true,
								username: true,
								email: true,
								createdAt: true,
							},
						}
					: false,
				business: businessId
					? {
							select: {
								id: true,
								name: true,
								email: true,
								createdAt: true,
							},
						}
					: false,
				tokenTransaction: tokenTransactionId
					? {
							select: {
								id: true,
								businessId: true,
								amount: true,
								type: true,
								createdAt: true,
							},
						}
					: false,
			},
		});
	}

	// USSD-specific method - bypasses user ownership validation since USSD already verified the user
	async createFromUSSD(
		createAccountRechargeInput: CreateAccountRechargeInput,
	) {
		const { clientId, businessId, tokenTransactionId, ...data } =
			createAccountRechargeInput;

		// Minimal validation
		if (clientId && businessId) {
			throw new Error("Only one of clientId or businessId should be provided");
		}
		if (!clientId && !businessId) {
			throw new Error("Either clientId or businessId must be provided");
		}

		// Validate tokenTransactionId if provided
		if (tokenTransactionId) {
			const tokenTransaction = await this.prisma.tokenTransaction.findUnique({
				where: { id: tokenTransactionId },
			});
			if (!tokenTransaction) {
				throw new Error("TokenTransaction not found");
			}
			if (
				tokenTransaction.isRedeemed !== true ||
				tokenTransaction.isReleased !== true
			) {
				throw new Error("TokenTransaction must be both redeemed and released");
			}
		}

		return this.prisma.accountRecharge.create({
			data: {
				...data,
                status: PaymentStatus.COMPLETED,
				client: clientId ? { connect: { id: clientId } } : undefined,
				business: businessId ? { connect: { id: businessId } } : undefined,
				tokenTransaction: tokenTransactionId
					? {
							connect: { id: tokenTransactionId },
						}
					: undefined,
			},
			include: {
				client: clientId
					? {
							select: {
								id: true,
								username: true,
								email: true,
								createdAt: true,
							},
						}
					: false,
				business: businessId
					? {
							select: {
								id: true,
								name: true,
								email: true,
								createdAt: true,
							},
						}
					: false,
				tokenTransaction: tokenTransactionId
					? {
							select: {
								id: true,
								businessId: true,
								amount: true,
								type: true,
								createdAt: true,
							},
						}
					: false,
			},
		});
	}

	private buildOwnerWhere(userId: string, userRole: string) {
		if (userRole === "business") {
			return { businessId: userId };
		}
		if (userRole === "client") {
			return { clientId: userId };
		}
		throw new Error("Invalid user role for account balance query");
	}

	async getBalance(
		userId: string,
		userRole: string,
		method?: RechargeMethod,
	) {
		const ownerWhere = this.buildOwnerWhere(userId, userRole);
		const where: any = {
			...ownerWhere,
			method: method || undefined,
		};

		const recharges = await this.prisma.accountRecharge.findMany({
			where,
			orderBy: { transactionDate: "desc" },
			include: {
				client: {
					select: {
						id: true,
						username: true,
						email: true,
						createdAt: true,
					},
				},
				business: {
					select: {
						id: true,
						name: true,
						email: true,
						createdAt: true,
					},
				},
				tokenTransaction: {
					select: {
						id: true,
						businessId: true,
						amount: true,
						type: true,
						createdAt: true,
					},
				},
			},
		});

		const totalAmount = sumPrecise(
			recharges.filter((r) => r.status === PaymentStatus.COMPLETED && r.method !== RechargeMethod.TOKEN).map((r) => r.amount),
		);
		const availableAmount = sumPrecise(
			recharges.filter((r) => r.status === PaymentStatus.COMPLETED && r.method !== RechargeMethod.TOKEN).map((r) => r.amount),
		);
		const pendingAmount = sumPrecise(
			recharges.filter((r) => r.status === PaymentStatus.PENDING && r.method !== RechargeMethod.TOKEN).map((r) => r.amount),
		);
		const reservedAmount = pendingAmount;

        // token balance
		const totalTokens = sumPrecise(
			recharges.filter((r) => r.method === RechargeMethod.TOKEN).map((r) => r.amount),
		);
		const availableTokens = sumPrecise(
			recharges.filter((r) => r.status === PaymentStatus.COMPLETED && r.method === RechargeMethod.TOKEN).map((r) => r.amount),
		);
		const pendingTokens = sumPrecise(
			recharges.filter((r) => r.status === PaymentStatus.PENDING && r.method === RechargeMethod.TOKEN).map((r) => r.amount),
		);

        const tokenBalance = {
            totalTokens,
            availableTokens,
            pendingTokens,
        }

		return {
			totalAmount,
			availableAmount,
			pendingAmount,
			reservedAmount,
			transactions: recharges,
            tokenBalance,
		};
	}

	async findAll(
		userId: string,
		userRole: string,
		method?: RechargeMethod,
		status?: string,
		origin?: string,
		startDate?: Date,
		endDate?: Date,
		page = 1,
		limit = 10,
	) {
		const ownerWhere = this.buildOwnerWhere(userId, userRole);
		const where: any = {
			...ownerWhere,
			method: method || undefined,
			status: status || undefined,
			origin: origin || undefined,
			transactionDate:
				startDate || endDate
					? {
						gte: startDate || undefined,
						lte: endDate || undefined,
					}
					: undefined,
		};

		const total = await this.prisma.accountRecharge.count({ where });
		const items = await this.prisma.accountRecharge.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { transactionDate: "desc" },
			include: {
				client: {
					select: {
						id: true,
						username: true,
						email: true,
						createdAt: true,
					},
				},
				business: {
					select: {
						id: true,
						name: true,
						email: true,
						createdAt: true,
					},
				},
				tokenTransaction: {
					select: {
						id: true,
						businessId: true,
						amount: true,
						type: true,
						createdAt: true,
					},
				},
			},
		});

		return {
			items,
			total,
			page,
			limit,
		};
	}

	async findOne(id: string) {
		return this.prisma.accountRecharge.findUnique({
			where: { id },
			include: {
				client: {
					select: {
						id: true,
						username: true,
						email: true,
						createdAt: true,
					},
				},
				business: {
					select: {
						id: true,
						name: true,
						email: true,
						createdAt: true,
					},
				},
				tokenTransaction: {
					select: {
						id: true,
						businessId: true,
						amount: true,
						type: true,
						createdAt: true,
					},
				},
			},
		});
	}

	async update(
		id: string,
		updateAccountRechargeInput: UpdateAccountRechargeInput,
		userId: string,
		userRole: string,
	) {
		const recharge = await this.findOne(id);
		if (!recharge) {
			throw new Error("Account recharge not found");
		}
		if (userRole === "client" && recharge.clientId !== userId) {
			throw new Error("Clients can only update their own recharges");
		}
		if (userRole === "business" && recharge.businessId !== userId) {
			throw new Error("Businesses can only update their own recharges");
		}

		const { amount, method, origin, status } = updateAccountRechargeInput;
		return this.prisma.accountRecharge.update({
			where: { id },
			data: {
				amount,
				method,
				origin,
				status: status ? (PaymentStatus[status as keyof typeof PaymentStatus] as PaymentStatus) : undefined,
			},
			include: {
				client: {
					select: {
						id: true,
						username: true,
						email: true,
					},
				},
				business: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				tokenTransaction: {
					select: {
						id: true,
						businessId: true,
						amount: true,
						type: true,
					},
				},
			},
		});
	}

	async remove(id: string, userId: string, userRole: string) {
		const recharge = await this.findOne(id);
		if (!recharge) {
			throw new Error("Account recharge not found");
		}
		if (userRole === "client" && recharge.clientId !== userId) {
			throw new Error("Clients can only delete their own recharges");
		}
		if (userRole === "business" && recharge.businessId !== userId) {
			throw new Error("Businesses can only delete their own recharges");
		}

		return this.prisma.accountRecharge.delete({
			where: { id },
			select: { id: true, amount: true },
		});
	}
}
