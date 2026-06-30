import { Injectable, Logger } from "@nestjs/common";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import {
	Country,
	RechargeMethod,
} from "../account-recharge/dto/create-account-recharge.input";
import { sumPrecise } from "../common/token-math";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTokenTransactionInput } from "./dto/create-token-transaction.input";
import { RedeemTokenTransactionInput } from "./dto/redeem-token-transaction.input";
import { ReleaseTokenTransactionInput } from "./dto/release-token-transaction.input";

const TX_INCLUDE = {
	business: {
		select: { id: true, name: true, email: true, createdAt: true },
	},
	reOwnedProduct: {
		select: {
			id: true, newProductId: true, originalProductId: true,
			oldOwnerId: true, newOwnerId: true, quantity: true,
			oldPrice: true, newPrice: true, createdAt: true,
		},
	},
	repostedProduct: {
		select: { id: true, productId: true, businessId: true, createdAt: true },
	},
};

// Service
@Injectable()
export class TokenTransactionService {
	private readonly logger = new Logger(TokenTransactionService.name);

	constructor(
		private prisma: PrismaService,
		private accountRechargeService: AccountRechargeService,
	) {}

	private async createAuditLog(
		tx: any,
		params: {
			businessId?: string;
			clientId?: string;
			action: "REDEEM" | "RELEASE" | "RECHARGE" | "WITHDRAW" | "CONVERT" | "TRANSFER" | "ADJUSTMENT";
			amount: number;
			balanceBefore: number;
			balanceAfter: number;
			metadata?: any;
			idempotencyKey?: string;
		},
	) {
		return tx.walletAuditLog.create({
			data: {
				businessId: params.businessId,
				clientId: params.clientId,
				action: params.action,
				amount: params.amount,
				balanceBefore: params.balanceBefore,
				balanceAfter: params.balanceAfter,
				metadata: params.metadata,
				idempotencyKey: params.idempotencyKey,
			},
		});
	}

	private async createLedgerEntry(
		tx: any,
		params: {
			businessId?: string;
			clientId?: string;
			type: "CREDIT" | "DEBIT";
			amount: number;
			balanceAfter: number;
			reference?: string;
			referenceType?: string;
			referenceId?: string;
			description: string;
		},
	) {
		return tx.ledgerEntry.create({
			data: {
				businessId: params.businessId,
				clientId: params.clientId,
				type: params.type,
				amount: params.amount,
				balanceAfter: params.balanceAfter,
				reference: params.reference,
				referenceType: params.referenceType,
				referenceId: params.referenceId,
				description: params.description,
			},
		});
	}

	private async getBusinessTokenBalance(tx: any, businessId: string): Promise<number> {
		const transactions = await tx.tokenTransaction.findMany({
			where: { businessId },
			select: { amount: true },
		});
		return sumPrecise(transactions.map((t: { amount: number }) => t.amount));
	}

	async create(createTokenTransactionInput: CreateTokenTransactionInput) {
		const { businessId, reOwnedProductId, repostedProductId, amount, type } =
			createTokenTransactionInput;
		const idempotencyKey = (createTokenTransactionInput as any).idempotencyKey;

		// Idempotency check
		if (idempotencyKey) {
			const existing = await this.prisma.tokenTransaction.findUnique({
				where: { idempotencyKey },
				include: TX_INCLUDE,
			});
			if (existing) {
				this.logger.log(`Idempotent hit: ${idempotencyKey}`);
				return existing;
			}
		}

		const business = await this.prisma.business.findUnique({
			where: { id: businessId },
		});
		if (!business) {
			throw new Error("Business not found");
		}

		if (reOwnedProductId && repostedProductId) {
			throw new Error(
				"Token transaction can only be linked to one of reOwnedProduct or repostedProduct",
			);
		}
		if (reOwnedProductId) {
			const reOwnedProduct = await this.prisma.reOwnedProduct.findUnique({
				where: { id: reOwnedProductId },
			});
			if (!reOwnedProduct) {
				throw new Error("ReOwnedProduct not found");
			}
		}
		if (repostedProductId) {
			const repostedProduct = await this.prisma.repostedProduct.findUnique({
				where: { id: repostedProductId },
			});
			if (!repostedProduct) {
				throw new Error("RepostedProduct not found");
			}
		}

		return this.prisma.$transaction(async (tx) => {
			const balanceBefore = await this.getBusinessTokenBalance(tx, businessId);

			const created = await tx.tokenTransaction.create({
				data: {
					business: { connect: { id: businessId } },
					reOwnedProduct: reOwnedProductId
						? { connect: { id: reOwnedProductId } }
						: undefined,
					repostedProduct: repostedProductId
						? { connect: { id: repostedProductId } }
						: undefined,
					amount,
					type,
					isRedeemed: false,
					isReleased: false,
					idempotencyKey,
				},
				include: TX_INCLUDE,
			});

			const balanceAfter = sumPrecise([balanceBefore, amount]);

			await this.createAuditLog(tx, {
				businessId,
				action: "RECHARGE",
				amount,
				balanceBefore,
				balanceAfter,
				metadata: { tokenTransactionId: created.id, type },
				idempotencyKey,
			});

			await this.createLedgerEntry(tx, {
				businessId,
				type: "CREDIT",
				amount,
				balanceAfter,
				referenceType: "TokenTransaction",
				referenceId: created.id,
				description: `Token transaction created: ${type} +${amount}`,
			});

			return created;
		});
	}

	async redeem(
		redeemTokenTransactionInput: RedeemTokenTransactionInput,
		businessId: string,
	) {
		const { tokenTransactionId, isRedeemed } = redeemTokenTransactionInput;

		return this.prisma.$transaction(async (tx) => {
			const tokenTransaction = await tx.tokenTransaction.findUnique({
				where: { id: tokenTransactionId },
				include: { reOwnedProduct: true, repostedProduct: true },
			});
			if (!tokenTransaction) {
				throw new Error("TokenTransaction not found");
			}
			if (tokenTransaction.businessId !== businessId) {
				throw new Error("Only the beneficial business can redeem tokens");
			}
			if (tokenTransaction.isRedeemed && isRedeemed) {
				throw new Error("Tokens already redeemed");
			}

			// Optimistic locking: update only if version matches
			const updatedTransaction = await tx.tokenTransaction.update({
				where: { id: tokenTransactionId, version: tokenTransaction.version },
				data: { isRedeemed, version: { increment: 1 } },
				include: TX_INCLUDE,
			});

			if (!tokenTransaction.reOwnedProduct?.oldOwnerId)
				throw new Error("Product Owner is missing");

			const balanceBefore = await this.getBusinessTokenBalance(tx, businessId);

			await this.createAuditLog(tx, {
				businessId,
				action: "REDEEM",
				amount: tokenTransaction.amount,
				balanceBefore,
				balanceAfter: balanceBefore,
				metadata: { tokenTransactionId, isRedeemed },
			});

			await this.createLedgerEntry(tx, {
				businessId,
				type: "CREDIT",
				amount: tokenTransaction.amount,
				balanceAfter: balanceBefore,
				referenceType: "TokenTransaction",
				referenceId: tokenTransactionId,
				description: `Token redeemed: ${tokenTransaction.amount} uTn`,
			});

			// If both redeemed and released, create AccountRecharge
			if (isRedeemed && updatedTransaction.isReleased) {
				await this.accountRechargeService.create(
					{
						businessId,
						amount: tokenTransaction.amount,
						method: RechargeMethod.MTN_MONEY,
						origin: Country.RWANDA,
						tokenTransactionId: tokenTransaction.id,
					},
					businessId,
					"business",
				);

				await this.accountRechargeService.create(
					{
						businessId: tokenTransaction.reOwnedProduct?.oldOwnerId,
						amount: -tokenTransaction.amount,
						method: RechargeMethod.TOKEN,
						origin: Country.RWANDA,
						tokenTransactionId: tokenTransaction.id,
					},
					tokenTransaction.reOwnedProduct?.oldOwnerId,
					"business",
				);
			}

			return updatedTransaction;
		});
	}

	async release(
		releaseTokenTransactionInput: ReleaseTokenTransactionInput,
		businessId: string,
	) {
		const { tokenTransactionId, isReleased } = releaseTokenTransactionInput;

		return this.prisma.$transaction(async (tx) => {
			const tokenTransaction = await tx.tokenTransaction.findUnique({
				where: { id: tokenTransactionId },
				include: { reOwnedProduct: true, repostedProduct: true },
			});
			if (!tokenTransaction) {
				throw new Error("TokenTransaction not found");
			}

			// Verify the releasing business is the product owner
			let productOwnerId: string | null = null;
			if (tokenTransaction.reOwnedProduct) {
				productOwnerId = tokenTransaction.reOwnedProduct.newOwnerId;
			} else if (tokenTransaction.repostedProduct) {
				const product = await tx.product.findUnique({
					where: { id: tokenTransaction.repostedProduct.productId },
					select: { businessId: true },
				});
				productOwnerId = product?.businessId || null;
			}
			if (!productOwnerId || productOwnerId !== businessId) {
				throw new Error("Only the product owner can release tokens");
			}
			if (tokenTransaction.isReleased && isReleased) {
				throw new Error("Tokens already released");
			}

			// Optimistic locking
			const updatedTransaction = await tx.tokenTransaction.update({
				where: { id: tokenTransactionId, version: tokenTransaction.version },
				data: { isReleased, version: { increment: 1 } },
				include: TX_INCLUDE,
			});

			const balanceBefore = await this.getBusinessTokenBalance(tx, businessId);

			await this.createAuditLog(tx, {
				businessId,
				action: "RELEASE",
				amount: tokenTransaction.amount,
				balanceBefore,
				balanceAfter: balanceBefore,
				metadata: { tokenTransactionId, isReleased },
			});

			await this.createLedgerEntry(tx, {
				businessId,
				type: "DEBIT",
				amount: tokenTransaction.amount,
				balanceAfter: balanceBefore,
				referenceType: "TokenTransaction",
				referenceId: tokenTransactionId,
				description: `Token released: ${tokenTransaction.amount} uTn`,
			});

			// If both redeemed and released, create AccountRecharge for debit
			if (isReleased && updatedTransaction.isRedeemed) {
				await this.accountRechargeService.create(
					{
						businessId: productOwnerId,
						amount: -tokenTransaction.amount,
						method: RechargeMethod.TOKEN,
						origin: Country.RWANDA,
						tokenTransactionId: tokenTransaction.id,
					},
					productOwnerId,
					"business",
				);

				await this.accountRechargeService.create(
					{
						businessId,
						amount: tokenTransaction.amount,
						method: RechargeMethod.MTN_MONEY,
						origin: Country.RWANDA,
						tokenTransactionId: tokenTransaction.id,
					},
					businessId,
					"business",
				);
			}

			return updatedTransaction;
		});
	}

	async getBalance(businessId: string) {
		const transactions = await this.prisma.tokenTransaction.findMany({
			where: { businessId },
			orderBy: { createdAt: "desc" },
			include: TX_INCLUDE,
		});

		const totalTokens = sumPrecise(transactions.map((tx) => tx.amount));
		const availableTokens = sumPrecise(
			transactions.filter((tx) => tx.isRedeemed && tx.isReleased).map((tx) => tx.amount),
		);
		const pendingTokens = sumPrecise(
			transactions
				.filter((tx) => (tx.isRedeemed && !tx.isReleased) || (!tx.isRedeemed && tx.isReleased))
				.map((tx) => tx.amount),
		);
		const reservedTokens = sumPrecise(
			transactions.filter((tx) => !tx.isRedeemed && !tx.isReleased).map((tx) => tx.amount),
		);

		return {
			totalTokens,
			availableTokens,
			pendingTokens,
			reservedTokens,
			transactions,
		};
	}

	async findAll(
		businessId: string,
		type?: string,
		isRedeemed?: boolean,
		isReleased?: boolean,
		startDate?: Date,
		endDate?: Date,
		page = 1,
		limit = 10,
	) {
		const where: any = {
			businessId,
			type: type || undefined,
			isRedeemed: typeof isRedeemed === "boolean" ? isRedeemed : undefined,
			isReleased: typeof isReleased === "boolean" ? isReleased : undefined,
			createdAt:
				startDate || endDate
					? {
						gte: startDate || undefined,
						lte: endDate || undefined,
					}
					: undefined,
		};

		const total = await this.prisma.tokenTransaction.count({ where });
		const items = await this.prisma.tokenTransaction.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: TX_INCLUDE,
		});

		return {
			items,
			total,
			page,
			limit,
		};
	}

	async findOne(id: string, businessId: string) {
		const tokenTransaction = await this.prisma.tokenTransaction.findUnique({
			where: { id },
			include: TX_INCLUDE,
		});
		if (!tokenTransaction) {
			throw new Error("TokenTransaction not found");
		}
		if (tokenTransaction.businessId !== businessId) {
			throw new Error("Access restricted to the associated business");
		}
		return tokenTransaction;
	}
}
