import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { put } from "@vercel/blob";
import { subDays } from "date-fns";
import { PubSub } from "graphql-subscriptions";
import * as puppeteer from "puppeteer";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import {
	Country,
	RechargeMethod,
} from "../account-recharge/dto/create-account-recharge.input";
import { AuthPayload } from "../auth/entities/auth-payload.entity";
import { BusinessService } from "../business/business.service";
import { Worker } from "../generated/prisma/client";
import { LoyaltyService } from "../loyalty-program/loyalty-program.service";
import {
	PaymentMethod,
	PaymentStatus,
} from "../payment-transaction/dto/create-payment-transaction.input";
import { PaymentTransactionService } from "../payment-transaction/payment-transaction.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProductService } from "../product/product.service";
import { StoreService } from "../store/store.service";
import { TokenTransactionType } from "../token-transaction/dto/create-token-transaction.input";
import { TokenTransactionService } from "../token-transaction/token-transaction.service";
import { WorkerService } from "../worker/worker.service";
import {
	CloseSaleInput,
	PaymentDetailsInput,
} from "./dto/close-sale.input";
import { CreateReturnInput } from "./dto/create-return.input";
import { CreateSaleInput } from "./dto/create-sale.input";
import { GenerateReceiptInput } from "./dto/receipt.input";
import { SaleProductInput } from "./dto/sale-product.input";
import { UpdateSaleInput } from "./dto/update-sale.input";
import { UpdateSaleProductInput } from "./dto/update-sale-product.input";

// Chart data point types
interface DailyChartPoint {
	name: string;
	startHour: number;
	endHour: number;
}

interface PeriodChartPoint {
	name: string;
	date: Date;
}

type ChartDataPoint = DailyChartPoint | PeriodChartPoint;

// Type guards
function isDailyChartPoint(point: ChartDataPoint): point is DailyChartPoint {
	return "startHour" in point && "endHour" in point;
}

function isPeriodChartPoint(point: ChartDataPoint): point is PeriodChartPoint {
	return "date" in point;
}

// Service
@Injectable()
export class SaleService {
	private readonly logger = new Logger(SaleService.name);
	constructor(
		private prisma: PrismaService,
		private configService: ConfigService,
		private storeService: StoreService,
		private workerService: WorkerService,
		private productService: ProductService,
		private accountRechargeService: AccountRechargeService,
		private paymentTransactionService: PaymentTransactionService,
		private loyaltyService: LoyaltyService,
		@Inject("PUB_SUB") private pubSub: PubSub,
	) {}

	async create(createSaleInput: CreateSaleInput, user: AuthPayload) {
		const {
			storeId,
			workerId,
			clientId,
			totalAmount,
			discount,
			paymentMethod,
			saleProducts,
		} = createSaleInput;

		// Validate store and access
		await this.storeService.verifyStoreAccess(storeId, user);

		let worker: Worker | null = null;
		let _actualWorkerId: string | undefined = workerId;

		// Handle worker validation based on user role
		if (user.role === "worker") {
			// Workers can only create sales for themselves
			worker = await this.workerService.findOne(user.id);
			if (!worker) throw new Error("Worker not found");
			_actualWorkerId = user.id;
		} else if (user.role === "business") {
			// Business owners can create sales with or without a specific worker
			if (workerId) {
				worker = await this.workerService.findOne(workerId);
				if (!worker) throw new Error("Worker not found");
				if (worker.businessId !== user.id) {
					throw new Error(
						"Business can only create sales for workers in their business",
					);
				}
				_actualWorkerId = workerId;
			} else {
				// Business sale without specific worker
				_actualWorkerId = undefined;
			}
		} else {
			throw new Error("Unauthorized to create sales");
		}

		// Validate client (if provided)
		if (clientId) {
			const client = await this.prisma.client.findUnique({
				where: { id: clientId },
			});
			if (!client) {
				throw new Error("Client not found");
			}
		}

		if (saleProducts) {
			// Validate products and quantity
			for (const sp of saleProducts) {
				const product = await this.productService.findOne(sp.productId);
				if (!product) throw new Error("Product not found");
				if (product.storeId !== storeId) {
					throw new Error(
						`Product ${sp.productId} does not belong to store ${storeId}`,
					);
				}
				if (product.quantity < sp.quantity) {
					throw new Error(`Insufficient quantity for product ${sp.productId}`);
				}
			}
		}

		// Calculate total
		let calculatedTotal = 0;
		const sales: (SaleProductInput & { uniquePrice: number })[] = [];

		if (saleProducts) {
			for (const sp of saleProducts) {
				const p = await this.prisma.product.findUnique({
					where: { id: sp.productId },
					select: {
						id: true,
						quantity: true,
						price: true,
						createdAt: true,
					},
				});
				if (!p) throw new Error("This product does not exist this store");
				calculatedTotal = calculatedTotal + p.price * sp.quantity;

				sales.push({
					...sp,
					uniquePrice: p.price,
				});
			}
		}

		const finalTotal = calculatedTotal - (discount || 0);
		if (totalAmount !== finalTotal) {
			// throw new Error(`Total amount (${totalAmount}) does not match calculated total (${finalTotal})`);
		}

		// Handle token payment
		if (paymentMethod === "TOKEN") {
			let bId = "";
			if (worker) bId = worker.businessId;
			else bId = user.id;
			const balance = await this.accountRechargeService.getBalance(
				clientId || bId,
				clientId ? "client" : "business",
				RechargeMethod.TOKEN,
			);
			if (balance < finalTotal) {
				throw new Error("Insufficient balance for token payment");
			}
			await this.accountRechargeService.create(
				{
					clientId: clientId || undefined,
					businessId: clientId ? undefined : bId,
					amount: -finalTotal,
					method: RechargeMethod.TOKEN,
					origin: Country.DRC,
				},
				clientId || bId,
				clientId ? "client" : "business",
			);
		}

		// Use transaction for all database operations
		const sale = await this.prisma.$transaction(async (tx) => {
			// Create sale
			const createdSale = await tx.sale.create({
				data: {
					store: { connect: { id: storeId } },
					worker: { connect: { id: _actualWorkerId } },
					client: clientId ? { connect: { id: clientId } } : undefined,
					totalAmount: finalTotal,
					discount: discount || 0,
					paymentMethod: paymentMethod || "CASH",
					status: paymentMethod === "TOKEN" ? "COMPLETED" : "OPEN",
					saleProducts:
						sales.length > 0
							? {
									create: sales.map((sp) => ({
										product: {
											connect: { id: sp.productId },
										},
										quantity: sp.quantity,
										price: sp.uniquePrice,
										modifiers: sp.modifiers,
									})),
								}
							: undefined,
				},
				include: {
					store: {
						select: {
							id: true,
							name: true,
							businessId: true,
							address: true,
							createdAt: true,
						},
					},
					worker: {
						select: {
							id: true,
							fullName: true,
							email: true,
							createdAt: true,
						},
					},
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
					saleProducts: {
						include: {
							product: {
								select: {
									id: true,
									title: true,
									price: true,
									quantity: true,
									createdAt: true,
								},
							},
						},
					},
					returns: true,
				},
			});

			// Update product quantities
			if (saleProducts) {
				for (const sp of saleProducts) {
					await tx.product.update({
						where: { id: sp.productId },
						data: {
							quantity: { decrement: sp.quantity },
						},
					});
				}
			}

			// Handle commissions for RepostedProduct and profit-sharing for ReOwnedProduct
			for (const sp of createdSale.saleProducts) {
				const reOwnedProduct = await tx.reOwnedProduct.findFirst({
					where: { newProductId: sp.productId },
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
						const profitShare = markup * 0.2 * sp.quantity; // 20% of markup
						await tx.tokenTransaction.create({
							data: {
								businessId: reOwnedProduct.oldOwnerId,
								reOwnedProductId: reOwnedProduct.id,
								amount: profitShare,
								type: TokenTransactionType.PROFIT_SHARE,
							},
						});
					}
				}

				const repostedProduct = await tx.repostedProduct.findFirst({
					where: { productId: sp.productId },
					select: {
						id: true,
						businessId: true,
					},
				});
				if (repostedProduct) {
					const commission = sp.price * 0.002 * sp.quantity; // 0.02% commission
					await tx.tokenTransaction.create({
						data: {
							businessId: repostedProduct.businessId,
							repostedProductId: repostedProduct.id,
							amount: commission,
							type: TokenTransactionType.REPOST_COMMISSION,
						},
					});
				}
			}

			// Update business sales metrics
			const businessId = worker ? worker.businessId : user.id;
			await tx.business.update({
				where: { id: businessId },
				data: {
					totalProductsSold: {
						increment: saleProducts
							? saleProducts.reduce((sum, sp) => sum + sp.quantity, 0)
							: 0,
					},
				},
			});

			// Award loyalty points if sale is CLOSED
			if (createdSale.status === "COMPLETED" && createdSale.clientId) {
				const loyaltyProgram = await tx.loyaltyProgram.findFirst({
					where: {
						businessId: createdSale.store.businessId,
					},
				});
				if (loyaltyProgram) {
					const points =
						createdSale.totalAmount * loyaltyProgram.pointsPerPurchase;
					await this.loyaltyService.createPointsTransaction(
						{
							clientId: sale.clientId!,
							loyaltyProgramId: loyaltyProgram.id,
							points,
						},
						user,
					);
				}
			}

			return createdSale;
		});

		// Publish event outside of transaction
		await this.pubSub.publish(`sale_created_${sale.storeId}`, {
			saleCreated: sale,
		});

		return sale;
	}

	async update(
		id: string,
		updateSaleInput: UpdateSaleInput,
		user: AuthPayload,
	) {
		const { clientId, totalAmount, discount, paymentMethod, saleProducts } =
			updateSaleInput;

		const sale = await this.prisma.sale.findUnique({
			where: { id },
			include: {
				saleProducts: true,
				store: true,
			},
		});
		if (!sale) {
			throw new Error("Sale not found");
		}
		await this.storeService.verifyStoreAccess(sale.storeId, user);
		if (user.role === "worker" && sale.workerId !== user.id) {
			throw new Error("Workers can only update their own sales");
		}
		if (sale.status !== "OPEN") {
			throw new Error("Can only update OPEN sales");
		}

		// Validate updates
		if (clientId) {
			const client = await this.prisma.client.findUnique({
				where: { id: clientId },
			});
			if (!client) {
				throw new Error("Client not found");
			}
		}
		if (saleProducts) {
			for (const sp of saleProducts) {
				const product = await this.productService.findOne(sp.productId);
				if (!product) throw new Error("Product not found");
				if (product.storeId !== sale.storeId) {
					throw new Error(
						`Product ${sp.productId} does not belong to store ${sale.storeId}`,
					);
				}
			}
		}

		// Calculate total if updated
		let finalTotal = sale.totalAmount;
		let calculatedTotal = 0;
		const sales: (SaleProductInput & { uniquePrice: number })[] = [];
		if (saleProducts || discount !== undefined) {
			if (saleProducts) {
				for (const sp of saleProducts) {
					const p = await this.prisma.product.findUnique({
						where: { id: sp.productId },
						select: {
							id: true,
							quantity: true,
							price: true,
							createdAt: true,
						},
					});
					if (!p) throw new Error("This product does not exist this store");
					calculatedTotal = calculatedTotal + p.price * sp.quantity;

					sales.push({
						...sp,
						uniquePrice: p.price,
					});
				}
			} else {
				calculatedTotal = sale.totalAmount;
			}

			finalTotal =
				calculatedTotal - (discount !== undefined ? discount : sale.discount);
		}
		if (totalAmount && totalAmount !== finalTotal) {
			// throw new Error(`Total amount (${totalAmount}) does not match calculated total (${finalTotal})`);
		}

		// Use transaction for all database operations
		const updatedSale = await this.prisma.$transaction(async (tx) => {
			// Update sale
			const updated = await tx.sale.update({
				where: { id },
				data: {
					client: clientId ? { connect: { id: clientId } } : undefined,
					totalAmount: finalTotal,
					discount: discount !== undefined ? discount : sale.discount,
					paymentMethod,
					saleProducts: sales
						? {
								deleteMany: {},
								create: sales.map((sp) => ({
									product: {
										connect: { id: sp.productId },
									},
									quantity: sp.quantity,
									price: sp.price ? sp.price : sp.uniquePrice,
									modifiers: sp.modifiers,
								})),
							}
						: undefined,
				},
				include: {
					store: {
						select: {
							id: true,
							name: true,
							address: true,
							createdAt: true,
						},
					},
					worker: {
						select: {
							id: true,
							fullName: true,
							email: true,
							createdAt: true,
						},
					},
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
					saleProducts: {
						include: {
							product: {
								select: {
									id: true,
									title: true,
									price: true,
									quantity: true,
									createdAt: true,
								},
							},
						},
					},
					returns: true,
				},
			});

			// Update quantity if saleProducts changed
			if (saleProducts) {
				// Restore old quantities
				for (const sp of sale.saleProducts) {
					await tx.product.update({
						where: { id: sp.productId },
						data: {
							quantity: {
								increment: sp.quantity,
							},
						},
					});
				}
				// Decrement new quantities
				for (const sp of saleProducts) {
					await tx.product.update({
						where: { id: sp.productId },
						data: {
							quantity: {
								decrement: sp.quantity,
							},
						},
					});
				}
			}

			return updated;
		});

		// Publish event outside of transaction
		await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, {
			saleUpdated: updatedSale,
		});

		return updatedSale;
	}

	async close(closeSaleInput: CloseSaleInput, user: AuthPayload) {
		const { saleId, clientId, paymentMethod, status, paymentDetails } =
			closeSaleInput;

		const sale = await this.prisma.sale.findUnique({
			where: { id: saleId },
			include: {
				saleProducts: true,
				store: true,
			},
		});
		if (!sale) {
			throw new Error("Sale not found");
		}
		await this.storeService.verifyStoreAccess(sale.storeId, user);

		// Allow business role to perform all operations
		// Only restrict workers to their own sales
		if (user.role === "worker" && sale.workerId !== user.id) {
			throw new Error("Workers can only close their own sales");
		}
		// Business users can close any sale in their business (already verified by verifyStoreAccess)
		if (sale.status !== "OPEN") {
			throw new Error("Sale is not OPEN");
		}

		// Use transaction for payment processing and status updates
		const closedSale = await this.prisma.$transaction(async (tx) => {
			// Handle different payment methods
			await this.processPayment(sale, paymentMethod, paymentDetails, user, tx);

			// Award loyalty points if closing to CLOSED
			if ((status || "COMPLETED") === "COMPLETED" && sale.clientId) {
				const loyaltyProgram = await tx.loyaltyProgram.findFirst({
					where: {
						businessId: sale.store.businessId,
					},
				});
				if (loyaltyProgram) {
					const points = sale.totalAmount * loyaltyProgram.pointsPerPurchase;
					await this.loyaltyService.createPointsTransaction(
						{
							clientId: sale.clientId!,
							loyaltyProgramId: loyaltyProgram.id,
							points,
						},
						user,
					);
				}
			}

			const updated = await tx.sale.update({
				where: { id: saleId },
				data: {
					paymentMethod: paymentMethod || sale.paymentMethod,
					status: status || "COMPLETED",
					client: { connect: { id: clientId } },
				},
				include: {
					store: {
						select: {
							id: true,
							name: true,
							address: true,
							createdAt: true,
						},
					},
					worker: {
						select: {
							id: true,
							fullName: true,
							email: true,
							createdAt: true,
						},
					},
					client: sale.clientId
						? {
								select: {
									id: true,
									username: true,
									email: true,
									createdAt: true,
								},
							}
						: false,
					saleProducts: {
						include: {
							product: {
								select: {
									id: true,
									title: true,
									price: true,
									quantity: true,
									createdAt: true,
								},
							},
						},
					},
					returns: true,
				},
			});

			// increment the current worker's shift sales
			const currentShift = await tx.shift.findFirst({
				where: {
					workerId: updated.workerId,
					storeId: updated.storeId,
					endTime: null,
				},
			});
			if (!currentShift) throw new Error("Something went while worker's shift");
			const shift = await tx.shift.update({
				where: {
					id: currentShift?.id,
				},
				data: {
					sales: {
						increment: updated.totalAmount,
					},
					transactionCount: { increment: 1 },
				},
			});

			// console.log("the shift: ", {shift})

			return updated;
		});

		// console.log(" updated salee: ", {closedSale})

		// Publish event outside of transaction
		await this.pubSub.publish(`sale_updated_${sale.storeId}`, {
			saleUpdated: closedSale,
		});

		return closedSale;
	}

	private async processPayment(
		sale: any,
		paymentMethod: string,
		paymentDetails: PaymentDetailsInput | undefined,
		user: AuthPayload,
		tx?: any,
	) {
		const prismaClient = tx || this.prisma;

		// Get worker info if sale has workerId, otherwise use business info
		let worker: Worker | null;
		let businessId = "";

		if (sale.workerId) {
			worker = await this.workerService.findOne(sale.workerId);
			if (!worker) throw new Error("Worker not found");
			businessId = worker.businessId;
		} else {
			// If no worker, get business from store
			businessId = sale.store.businessId;
		}

		// If current user is business, they can process any sale in their business
		if (user.role === "business" && user.id !== businessId) {
			throw new Error("Business can only process payments for their own sales");
		}

		switch (paymentMethod) {
			case "TOKEN":
				await this.processTokenPayment(sale, { businessId }, user, tx);
				break;
			case "MOBILE_MONEY":
				await this.processMobileMoneyPayment(
					sale,
					paymentDetails,
					{ businessId },
					user,
					tx,
				);
				break;
			case "CARD":
				await this.processCardPayment(
					sale,
					paymentDetails,
					{ businessId },
					user,
					tx,
				);
				break;
			case "CASH":
				// Cash payment doesn't require additional processing
				break;
			default:
				throw new Error(`Unsupported payment method: ${paymentMethod}`);
		}
	}

	private async processTokenPayment(
		sale: any,
		workerInfo: any,
		user: AuthPayload,
		tx?: any,
	) {
		const prismaClient = tx || this.prisma;

		// Calculate token amount (1 uTn = $10)
		const tokenAmount = sale.totalAmount / 10;

		// Check if client or business is paying
		const payerId = sale.clientId || user.id;
		const payerType = sale.clientId ? "client" : "business";

		const balance = await this.accountRechargeService.getBalance(
			payerId,
			payerType,
			RechargeMethod.TOKEN,
		);
		if (balance < sale.totalAmount) {
			throw new Error("Insufficient token balance for payment");
		}

		// Deduct from payer (client or business)
		await this.accountRechargeService.create(
			{
				clientId: sale.clientId || undefined,
				businessId: sale.clientId ? undefined : workerInfo.businessId,
				amount: -tokenAmount,
				method: RechargeMethod.TOKEN,
				origin: Country.DRC,
			},
			payerId,
			payerType,
		);

		// Credit to business (if client paid) or worker's business (if business paid)
		if (sale.clientId) {
			// Client paid, credit business
			await this.accountRechargeService.create(
				{
					businessId: workerInfo.businessId,
					amount: sale.totalAmount,
					method: RechargeMethod.TOKEN,
					origin: Country.DRC,
				},
				workerInfo.businessId,
				"business",
			);
		}
	}

	private async processMobileMoneyPayment(
		sale: any,
		paymentDetails: PaymentDetailsInput | undefined,
		workerInfo: any,
		_user: AuthPayload,
		tx?: any,
	) {
		const prismaClient = tx || this.prisma;

		if (!paymentDetails?.mobileMoneyMethod || !paymentDetails?.country) {
			throw new Error(
				"Mobile money method and country are required for mobile money payments",
			);
		}

		// Generate mock payment code based on mobile money type and country
		const paymentCode = this.generateMobileMoneyCode(
			paymentDetails.mobileMoneyMethod,
			paymentDetails.country,
		);

		// Create payment transaction record
		await this.paymentTransactionService.create(
			{
				amount: sale.totalAmount,
				method: PaymentMethod.MOBILE_MONEY,
				status: paymentDetails.operatorTransactionId
					? PaymentStatus.COMPLETED
					: PaymentStatus.PENDING,
				qrCode: paymentCode,
			},
			sale.clientId,
		);

		// If operator transaction ID is provided, mark as completed
		if (paymentDetails.operatorTransactionId) {
			// Credit business account
			await this.accountRechargeService.create(
				{
					businessId: workerInfo.businessId,
					amount: sale.totalAmount,
					method: paymentDetails.mobileMoneyMethod,
					origin: paymentDetails.country,
				},
				workerInfo.businessId,
				"business",
			);
		}
	}

	private async processCardPayment(
		sale: any,
		paymentDetails: PaymentDetailsInput | undefined,
		workerInfo: any,
		_user: AuthPayload,
		tx?: any,
	) {
		const prismaClient = tx || this.prisma;

		if (
			!paymentDetails?.cardNumber ||
			!paymentDetails?.cardHolderName ||
			!paymentDetails?.expiryDate ||
			!paymentDetails?.cvv
		) {
			throw new Error(
				"Complete card information is required for card payments",
			);
		}

		// Simulate card processing
		const isValidCard = this.validateCardDetails(paymentDetails);
		if (!isValidCard) {
			throw new Error("Invalid card details");
		}

		// Create payment transaction record
		await this.paymentTransactionService.create(
			{
				amount: sale.totalAmount,
				method: PaymentMethod.CARD,
				status: PaymentStatus.COMPLETED,
			},
			sale.clientId,
		);

		// Credit business account
		await this.accountRechargeService.create(
			{
				businessId: workerInfo.businessId,
				amount: sale.totalAmount,
				method: RechargeMethod.TOKEN, // Convert to platform tokens
				origin: Country.DRC,
			},
			workerInfo.businessId,
			"business",
		);
	}

	private generateMobileMoneyCode(
		method: RechargeMethod,
		country: Country,
	): string {
		const prefixes = {
			[RechargeMethod.MTN_MONEY]: "MTN",
			[RechargeMethod.AIRTEL_MONEY]: "AIR",
			[RechargeMethod.ORANGE_MONEY]: "ORA",
			[RechargeMethod.MPESA]: "MPE",
		};

		const countryCode = country.substring(0, 2);
		const prefix = prefixes[method] || "MOB";
		const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		return `*${prefix}*${countryCode}*${randomCode}#`;
	}

	private validateCardDetails(paymentDetails: PaymentDetailsInput): boolean {
		// Basic card validation (in real implementation, use proper card validation)
		const cardNumber = paymentDetails.cardNumber?.replace(/\s/g, "");
		if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
			return false;
		}

		// Check expiry date format (MM/YY)
		const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
		if (
			!paymentDetails.expiryDate ||
			!expiryRegex.test(paymentDetails.expiryDate)
		) {
			return false;
		}

		// Check CVV (3-4 digits)
		const cvvRegex = /^\d{3,4}$/;
		if (!paymentDetails.cvv || !cvvRegex.test(paymentDetails.cvv)) {
			return false;
		}

		return true;
	}

	async createReturn(createReturnInput: CreateReturnInput, user: AuthPayload) {
		const { saleId, reason } = createReturnInput;

		const sale = await this.prisma.sale.findUnique({
			where: { id: saleId },
			include: {
				saleProducts: true,
				store: true,
			},
		});
		if (!sale) {
			throw new Error("Sale not found");
		}
		await this.storeService.verifyStoreAccess(sale.storeId, user);
		if (user.role === "worker" && sale.workerId !== user.id) {
			throw new Error("Workers can only process returns for their own sales");
		}
		if (sale.status === "REFUNDED") {
			throw new Error("Sale already refunded");
		}

		// Use transaction for all database operations
		const returnRecord = await this.prisma.$transaction(async (tx) => {
			// Revert quantity
			for (const sp of sale.saleProducts) {
				await tx.product.update({
					where: { id: sp.productId },
					data: {
						quantity: { increment: sp.quantity },
					},
				});
			}

			// Refund token payment if applicable
			if (sale.paymentMethod === "TOKEN") {
				const worker = await this.workerService.findOne(sale.workerId);
				if (!worker) throw new Error("Worker not found");
				await this.accountRechargeService.create(
					{
						clientId: sale.clientId || undefined,
						businessId: sale.clientId ? undefined : worker.businessId,
						amount: sale.totalAmount,
						method: RechargeMethod.TOKEN,
						origin: Country.DRC,
					},
					sale.clientId || worker.businessId,
					sale.clientId ? "client" : "business",
				);
			}

			const created = await tx.return.create({
				data: {
					sale: { connect: { id: saleId } },
					reason,
					status: "REFUNDED",
				},
				include: { sale: true },
			});

			await tx.sale.update({
				where: { id: saleId },
				data: { status: "REFUNDED" },
			});

			return created;
		});

		return returnRecord;
	}

	async findAll(storeId: string, user: AuthPayload) {
		await this.storeService.verifyStoreAccess(storeId, user);
		return this.prisma.sale.findMany({
			where: { storeId },
			include: {
				store: {
					select: {
						id: true,
						name: true,
						address: true,
						createdAt: true,
					},
				},
				worker: {
					select: {
						id: true,
						fullName: true,
						role: true,
					},
				},
				client: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
				saleProducts: {
					select: {
						id: true,
						quantity: true,
						price: true,
						modifiers: true,
						createdAt: true,
						product: {
							select: {
								id: true,
								title: true,
								description: true,
								price: true,
								medias: {
									select: { url: true },
								},
							},
						},
					},
				},
				returns: {
					select: {
						id: true,
						reason: true,
						status: true,
						createdAt: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string, user: AuthPayload) {
		const sale = await this.prisma.sale.findUnique({
			where: { id },
			include: {
				store: {
					select: {
						id: true,
						name: true,
						address: true,
						createdAt: true,
					},
				},
				worker: {
					select: {
						id: true,
						fullName: true,
						role: true,
					},
				},
				client: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
				saleProducts: {
					select: {
						id: true,
						quantity: true,
						price: true,
						modifiers: true,
						createdAt: true,
						product: {
							select: {
								id: true,
								title: true,
								description: true,
								price: true,
								medias: {
									select: { url: true },
								},
							},
						},
					},
				},
				returns: {
					select: {
						id: true,
						reason: true,
						status: true,
						createdAt: true,
					},
				},
			},
		});
		if (!sale) {
			throw new Error("Sale not found");
		}
		await this.storeService.verifyStoreAccess(sale.storeId, user);
		if (user.role === "worker" && sale.workerId !== user.id) {
			throw new Error("Workers can only view their own sales");
		}
		return sale;
	}

	async generateReceipt(input: GenerateReceiptInput, user: AuthPayload) {
		const { saleId, email } = input;

		const sale = await this.prisma.sale.findUnique({
			where: { id: saleId },
			include: {
				store: {
					include: {
						business: true,
					},
				},
				worker: true,
				client: true,
				saleProducts: {
					include: {
						product: true,
					},
				},
			},
		});

		if (!sale) throw new Error("Sale not found");

		// Verify store access
		await this.verifyStoreAccess(sale.storeId, user);

		if (user.role === "WORKER" && sale.workerId !== user.id) {
			throw new Error("Workers can only generate receipts for their own sales");
		}

		// Calculate loyalty points if applicable
		let pointsEarned = 0;
		if (sale.clientId) {
			const loyaltyProgram = await this.prisma.loyaltyProgram.findFirst({
				where: {
					businessId: sale.store.businessId,
				},
			});
			if (loyaltyProgram) {
				// Assuming pointsPerPurchase is the multiplier (e.g., 0.1 for 10% back as points)
				pointsEarned = sale.totalAmount * loyaltyProgram.pointsPerPurchase;
			}
		}

		// Generate HTML receipt
		const html = this.generateReceiptHTML(sale, pointsEarned);

		// Generate PDF Buffer in memory using Puppeteer
		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"], // Important for deployment environments like Vercel
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

		// Prepare filename for Vercel Blob
		const fileName = `receipt_${sale.id.substring(0, 8)}_${Date.now()}.pdf`;

		// Upload PDF buffer to Vercel Blob
		const blobToken = this.configService.get<string>(
			"NEST_PUBLIC_BLOB_READ_WRITE_TOKEN",
		); // Ensure this is set in your environment
		if (!blobToken) {
			this.logger.error(
				"NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN is missing in environment variables.",
			);
			throw new Error(
				"Blob upload configuration error. Please contact support.",
			);
		}

		const blob = await put(`receipts/${fileName}`, Buffer.from(pdfBuffer), {
			access: "public", // Make the receipt publicly accessible via the URL
			contentType: "application/pdf", // Explicitly set the content type
			token: blobToken,
		});

		// Create a Media record to store the receipt metadata
		const mediaRecord = await this.prisma.media.create({
			data: {
				url: blob.url,
				type: "DOCUMENT",
				size: BigInt(pdfBuffer.length),
				pathname: blob.pathname,
				storeId: sale.storeId,
				businessId: sale.store.businessId,
			},
		});

		// Update the Sale record with the receipt URL
		await this.prisma.sale.update({
			where: { id: saleId },
			data: {
				receiptUrl: blob.url,
			},
		});

		// Send email if provided (logic remains the same, now using the public URL)
		let emailSent = false;
		if (email && sale.client?.email) {
			try {
				// In a real app, integrate with your email service (e.g., SendGrid, Nodemailer)
				console.log(
					`Simulated sending receipt email to ${email} with URL: ${blob.url}`,
				);
				// Example: await this.emailService.sendReceipt(email, blob.url, sale);
				emailSent = true;
			} catch (emailError) {
				this.logger.error(
					`Failed to send email receipt to ${email}`,
					emailError,
				);
				emailSent = false;
			}
		}

		// Return the public URL and email status
		return {
			receiptUrl: blob.url, // Return the public URL instead of a local path
			emailSent,
			fileName, // Optionally return filename if needed elsewhere
			mediaId: mediaRecord.id, // Return the ID of the created Media record
		};
	}

	private generateReceiptHTML(sale: any, pointsEarned: number): string {
		// Format business type with appropriate icon
		const getBusinessTypeIcon = (type: string) => {
			switch (type) {
				case "ARTISAN":
					return "🎨";
				case "BOOKSTORE":
					return "📚";
				case "ELECTRONICS":
					return "🔌";
				case "HARDWARE":
					return "🔨";
				case "GROCERY":
					return "🛒";
				case "CAFE":
					return "☕";
				case "RESTAURANT":
					return "🍽️";
				case "RETAIL":
					return "🏬";
				case "BAR":
					return "🍷";
				case "CLOTHING":
					return "👕";
				default:
					return "🏢";
			}
		};

		// Format payment method
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

		return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${sale.id.substring(0, 8)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #ffffff;
      color: #1f2937;
      line-height: 1.5;
      padding: 20px;
    }
    
    .receipt-container {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .receipt-header {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      padding: 20px;
      text-align: center;
      position: relative;
    }
    
    .business-logo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
      font-size: 24px;
    }
    
    .business-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .business-type {
      font-size: 14px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    
    .receipt-title {
      font-size: 16px;
      font-weight: 600;
      margin-top: 15px;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .receipt-meta {
      background: #f9fafb;
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .meta-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .meta-label {
      color: #6b7280;
      font-weight: 500;
    }
    
    .meta-value {
      color: #1f2937;
      font-weight: 500;
    }
    
    .items-section {
      padding: 20px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .items-list {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 15px;
    }
    
    .item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .item-name {
      flex: 2;
      color: #1f2937;
    }
    
    .item-quantity {
      flex: 1;
      text-align: center;
      color: #6b7280;
    }
    
    .item-price {
      flex: 1;
      text-align: right;
      color: #1f2937;
      font-weight: 500;
    }
    
    .modifiers {
      font-size: 12px;
      color: #9ca3af;
      margin-left: 20px;
    }
    
    .totals-section {
      padding: 20px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .total-label {
      color: #6b7280;
    }
    
    .total-value {
      color: #1f2937;
      font-weight: 500;
    }
    
    .grand-total {
      border-top: 2px solid #e5e7eb;
      padding-top: 10px;
      margin-top: 10px;
    }
    
    .grand-total-label {
      color: #1f2937;
      font-weight: 600;
      font-size: 16px;
    }
    
    .grand-total-value {
      color: #f97316;
      font-weight: bold;
      font-size: 18px;
    }
    
    .loyalty-section {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 15px;
      margin: 20px;
      text-align: center;
    }
    
    .loyalty-title {
      font-weight: 600;
      color: #d97706;
      margin-bottom: 5px;
    }
    
    .loyalty-points {
      font-size: 18px;
      font-weight: bold;
      color: #d97706;
    }
    
    .footer {
      padding: 20px;
      text-align: center;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    
    .usc-logo {
      margin-bottom: 10px;
      font-size: 24px;
      color: #f97316;
    }
    
    .thank-you {
      font-weight: 500;
      margin-bottom: 5px;
    }
    
    .qr-code {
      margin-top: 15px;
      text-align: center;
    }
    
    .qr-placeholder {
      width: 100px;
      height: 100px;
      background: #e5e7eb;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="receipt-header">
      <div class="business-logo">
        ${getBusinessTypeIcon(sale.store.business.businessType)}
      </div>
      <div class="business-name">${sale.store.business.name}</div>
      <div class="business-type">
        ${getBusinessTypeIcon(sale.store.business.businessType)} 
        ${
					sale.store.business.businessType === "ARTISAN"
						? "Artisan & Handcrafted Goods"
						: sale.store.business.businessType === "BOOKSTORE"
							? "Bookstore & Stationery"
							: sale.store.business.businessType === "ELECTRONICS"
								? "Electronics & Gadgets"
								: sale.store.business.businessType === "HARDWARE"
									? "Hardware & Tools"
									: sale.store.business.businessType === "GROCERY"
										? "Grocery & Convenience"
										: sale.store.business.businessType === "CAFE"
											? "Café & Coffee Shops"
											: sale.store.business.businessType === "RESTAURANT"
												? "Restaurant & Dining"
												: sale.store.business.businessType === "RETAIL"
													? "Retail & General Stores"
													: sale.store.business.businessType === "BAR"
														? "Bar & Pub"
														: sale.store.business.businessType === "CLOTHING"
															? "Clothing & Accessories"
															: sale.store.business.businessType
				}
      </div>
      <div class="receipt-title">RECEIPT #${sale.id.substring(0, 8)}</div>
    </div>
    
    <!-- Metadata -->
    <div class="receipt-meta">
      <div class="meta-item">
        <span class="meta-label">Store</span>
        <span class="meta-value">${sale.store.name}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date</span>
        <span class="meta-value">${new Date(sale.createdAt).toLocaleDateString(
					"en-US",
					{
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					},
				)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Cashier</span>
        <span class="meta-value">${sale.worker?.fullName || "N/A"}</span>
      </div>
      ${
				sale.client
					? `
      <div class="meta-item">
        <span class="meta-label">Customer</span>
        <span class="meta-value">${sale.client.fullName}</span>
      </div>`
					: ""
			}
    </div>
    
    <!-- Items -->
    <div class="items-section">
      <div class="section-title">Items Purchased</div>
      <div class="items-list">
        ${sale.saleProducts
					.map(
						(sp: any) => `
          <div class="item-row">
            <div class="item-name">${sp.product.title}</div>
            <div class="item-quantity">×${sp.quantity}</div>
            <div class="item-price">$${(sp.price * sp.quantity).toFixed(2)}</div>
          </div>
          ${sp.modifiers ? `<div class="modifiers">(${sp.modifiers})</div>` : ""}
        `,
					)
					.join("")}
      </div>
      
      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span class="total-value">$${sale.totalAmount.toFixed(2)}</span>
        </div>
        ${
					sale.discount > 0
						? `
        <div class="total-row">
          <span class="total-label">Discount</span>
          <span class="total-value">-$${sale.discount.toFixed(2)}</span>
        </div>`
						: ""
				}
        <div class="total-row">
          <span class="total-label">Tax</span>
          <span class="total-value">$${(sale.totalAmount * 0.18).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span class="total-label grand-total-label">TOTAL</span>
          <span class="total-value grand-total-value">$${(sale.totalAmount - sale.discount + sale.totalAmount * 0.18).toFixed(2)}</span>
        </div>
        
        <div class="total-row">
          <span class="total-label">Payment Method</span>
          <span class="total-value">${formatPaymentMethod(sale.paymentMethod)}</span>
        </div>
      </div>
    </div>
    
    <!-- Loyalty Points -->
    ${
			pointsEarned > 0
				? `
    <div class="loyalty-section">
      <div class="loyalty-title">LOYALTY PROGRAM</div>
      <div>You earned</div>
      <div class="loyalty-points">${pointsEarned.toFixed(2)} points</div>
      <div>on this purchase</div>
    </div>`
				: ""
		}
    
    <!-- Footer -->
    <div class="footer">
      <div class="usc-logo">Uscor Marketplace</div>
      <div class="thank-you">Thank you for your business!</div>
      <div>Visit us at www.uscor.rw</div>
      <div>+250 788 123 456</div>
      
      <div class="qr-code">
        <div class="qr-placeholder">QR CODE</div>
        <div>Scan for next purchase</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
	}

	private async verifyStoreAccess(storeId: string, user: AuthPayload) {
		const store = await this.prisma.store.findUnique({
			where: { id: storeId },
			include: { business: true },
		});

		if (!store) throw new Error("Store not found");

		if (user.role === "ADMIN") return; // Admins have full access

		if (user.role === "WORKER") {
			const worker = await this.prisma.worker.findUnique({
				where: { id: user.id },
			});
			if (worker?.businessId !== store.businessId) {
				throw new Error("Worker does not belong to this business");
			}
		} else if (user.role === "BUSINESS") {
			if (user.id !== store.businessId) {
				throw new Error("Business does not own this store");
			}
		}
	}

	// Add these methods to your existing SaleService class

	async findActiveSales(storeId: string, user: AuthPayload) {
		await this.storeService.verifyStoreAccess(storeId, user);

		const whereClause: any = {
			storeId,
			status: "OPEN",
		};

		if (user.role === "worker") {
			whereClause.workerId = user.id;
		}

		return this.prisma.sale.findMany({
			where: whereClause,
			include: {
				store: {
					select: {
						id: true,
						name: true,
						address: true,
						createdAt: true,
					},
				},
				worker: {
					select: {
						id: true,
						fullName: true,
						role: true,
					},
				},
				client: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
				saleProducts: {
					select: {
						id: true,
						quantity: true,
						price: true,
						modifiers: true,
						createdAt: true,
						product: {
							select: {
								id: true,
								title: true,
								description: true,
								price: true,
								medias: {
									select: { url: true },
								},
							},
						},
					},
				},
				returns: {
					select: {
						id: true,
						reason: true,
						status: true,
						createdAt: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async findSalesWithPagination(
		params: {
			storeId?: string;
			workerId?: string;
			startDate?: Date;
			endDate?: Date;
			status?: string;
			page?: number;
			limit?: number;
		},
		user: AuthPayload,
	) {
		const {
			storeId,
			workerId,
			startDate,
			endDate,
			status,
			page = 1,
			limit = 20,
		} = params;

		if (storeId) {
			await this.storeService.verifyStoreAccess(storeId, user);
		}

		const whereClause: any = {};

		if (storeId) whereClause.storeId = storeId;
		if (workerId) whereClause.workerId = workerId;
		if (user.role === "worker") whereClause.workerId = user.id;
		if (status) whereClause.status = status;
		if (startDate || endDate) {
			whereClause.createdAt = {};
			if (startDate) whereClause.createdAt.gte = startDate;
			if (endDate) whereClause.createdAt.lte = endDate;
		}

		if (user.role === "worker" && !workerId) {
			whereClause.workerId = user.id;
		}

		const [items, total] = await Promise.all([
			this.prisma.sale.findMany({
				where: whereClause,
				include: {
					store: {
						select: {
							id: true,
							name: true,
							address: true,
							createdAt: true,
						},
					},
					worker: {
						select: {
							id: true,
							fullName: true,
							role: true,
						},
					},
					client: {
						select: {
							id: true,
							fullName: true,
							email: true,
						},
					},
					saleProducts: {
						select: {
							id: true,
							quantity: true,
							price: true,
							modifiers: true,
							createdAt: true,
							product: {
								select: {
									id: true,
									title: true,
									description: true,
									price: true,
									medias: {
										select: { url: true },
									},
								},
							},
						},
					},
					returns: {
						select: {
							id: true,
							reason: true,
							status: true,
							createdAt: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prisma.sale.count({
				where: whereClause,
			}),
		]);

		return { items, total, page, limit };
	}

	async getSalesDashboard(
		storeId: string,
		period: string = "day",
		user: AuthPayload,
	) {
		await this.storeService.verifyStoreAccess(storeId, user);

		const now = new Date();
		let startDate: Date;
		let chartDataPoints: ChartDataPoint[] = [];

		switch (period) {
			case "week":
				startDate = subDays(now, 7);
				chartDataPoints = this.generateWeeklyChartPoints();
				break;
			case "month":
				startDate = subDays(now, 30);
				chartDataPoints = this.generateMonthlyChartPoints();
				break;
			default:
				startDate = subDays(now, 1);
				chartDataPoints = this.generateDailyChartPoints();
		}

		const whereClause: any = {
			storeId,
			createdAt: { gte: startDate },
			status: { not: "REFUNDED" },
		};

		if (user.role === "worker") {
			whereClause.workerId = user.id;
		}

		const [salesMetrics, topProductsData, paymentMethodsData] =
			await Promise.all([
				this.prisma.sale.aggregate({
					where: whereClause,
					_count: true,
					_sum: { totalAmount: true },
					_avg: { totalAmount: true },
				}),

				this.prisma.saleProduct.groupBy({
					by: ["productId"],
					where: {
						sale: whereClause,
					},
					_sum: { quantity: true },
					orderBy: { _sum: { quantity: "desc" } },
					take: 5,
				}),

				this.prisma.sale.groupBy({
					by: ["paymentMethod"],
					where: whereClause,
					_count: true,
					_sum: { totalAmount: true },
				}),
			]);

		// Get product details for top products
		const topProducts = await Promise.all(
			topProductsData.map(async (item) => {
				const product = await this.prisma.product.findUnique({
					where: { id: item.productId },
					select: { id: true, title: true },
				});
				return {
					id: product?.id,
					title: product?.title,
					quantitySold: item._sum.quantity || 0,
				};
			}),
		);

		// Generate chart data with actual sales data
		const chartData = await this.generateChartData(
			storeId,
			period,
			user,
			chartDataPoints,
		);

		return {
			totalSales: salesMetrics._count,
			totalRevenue: salesMetrics._sum.totalAmount || 0,
			averageTicket: salesMetrics._avg.totalAmount || 0,
			topProducts,
			paymentMethods: paymentMethodsData.map((pm) => ({
				method: pm.paymentMethod,
				count: pm._count,
				amount: pm._sum.totalAmount || 0,
			})),
			chartData,
		};
	}

	private generateDailyChartPoints(): DailyChartPoint[] {
		const hours: DailyChartPoint[] = [];
		for (let i = 0; i < 24; i++) {
			hours.push({
				name: `${i}:00`,
				startHour: i,
				endHour: i + 1,
			});
		}
		return hours;
	}

	private generateWeeklyChartPoints(): PeriodChartPoint[] {
		const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		const now = new Date();
		const weekData: PeriodChartPoint[] = [];

		for (let i = 6; i >= 0; i--) {
			const date = subDays(now, i);
			weekData.push({
				name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
				date: date,
			});
		}
		return weekData;
	}

	private generateMonthlyChartPoints(): PeriodChartPoint[] {
		const now = new Date();
		const monthData: PeriodChartPoint[] = [];

		for (let i = 29; i >= 0; i--) {
			const date = subDays(now, i);
			monthData.push({
				name: `${date.getDate()}/${date.getMonth() + 1}`,
				date: date,
			});
		}
		return monthData;
	}

	private async generateChartData(
		storeId: string,
		period: string,
		user: AuthPayload,
		chartDataPoints: ChartDataPoint[],
	) {
		const whereClause: any = {
			storeId,
			status: { not: "REFUNDED" },
		};

		if (user.role === "worker") {
			whereClause.workerId = user.id;
		}

		const chartData = await Promise.all(
			chartDataPoints.map(async (point) => {
				const periodWhereClause = { ...whereClause };

				if (period === "day" && isDailyChartPoint(point)) {
					// For daily view, group by hours
					const startOfDay = new Date();
					startOfDay.setHours(point.startHour, 0, 0, 0);
					const endOfDay = new Date();
					endOfDay.setHours(point.endHour, 0, 0, 0);

					periodWhereClause.createdAt = {
						gte: startOfDay,
						lt: endOfDay,
					};
				} else if (isPeriodChartPoint(point)) {
					// For weekly and monthly views, group by days
					const startOfDay = new Date(point.date);
					startOfDay.setHours(0, 0, 0, 0);
					const endOfDay = new Date(point.date);
					endOfDay.setHours(23, 59, 59, 999);

					periodWhereClause.createdAt = {
						gte: startOfDay,
						lte: endOfDay,
					};
				}

				const salesData = await this.prisma.sale.aggregate({
					where: periodWhereClause,
					_count: true,
					_sum: { totalAmount: true },
				});

				return {
					name: point.name,
					sales: salesData._sum.totalAmount || 0,
					transactions: salesData._count || 0,
				};
			}),
		);

		return chartData;
	}

	async addSaleProduct(
		input: {
			saleId: string;
			productId: string;
			quantity: number;
			modifiers?: any;
		},
		user: AuthPayload,
	) {
		const sale = await this.prisma.sale.findUnique({
			where: { id: input.saleId },
			include: { store: true },
		});

		if (!sale) throw new Error("Sale not found");
		if (sale.status !== "OPEN")
			throw new Error("Can only add products to OPEN sales");

		await this.storeService.verifyStoreAccess(sale.storeId, user);
		if (user.role === "worker" && sale.workerId !== user.id) {
			throw new Error("Workers can only modify their own sales");
		}

		const product = await this.productService.findOne(input.productId);
		if (!product) throw new Error("Product not found");
		if (product.storeId !== sale.storeId) {
			throw new Error("Product does not belong to this store");
		}
		if (product.quantity < input.quantity) {
			throw new Error("Insufficient product quantity");
		}

		// Use transaction for all database operations
		const saleProduct = await this.prisma.$transaction(async (tx) => {
			const created = await tx.saleProduct.create({
				data: {
					sale: { connect: { id: input.saleId } },
					product: {
						connect: { id: input.productId },
					},
					quantity: input.quantity,
					price: product.price,
					modifiers: input.modifiers,
				},
				include: {
					product: {
						select: {
							id: true,
							title: true,
							description: true,
							price: true,
						},
					},
				},
			});

			// Update sale total
			await tx.sale.update({
				where: { id: input.saleId },
				data: {
					totalAmount: {
						increment: product.price * input.quantity,
					},
				},
			});

			// Update product stock
			await tx.product.update({
				where: { id: input.productId },
				data: {
					quantity: { decrement: input.quantity },
				},
			});

			return created;
		});

		const updatedSale = await this.findOne(input.saleId, user);
		await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, {
			saleUpdated: updatedSale,
		});

		return saleProduct;
	}

	async updateSaleProduct(
		id: string,
		input: UpdateSaleProductInput,
		user: AuthPayload,
	) {
		const saleProduct = await this.prisma.saleProduct.findUnique({
			where: { id },
			include: {
				sale: { include: { store: true } },
				product: {
					select: {
						price: true,
						quantity: true,
					},
				},
			},
		});

		if (!saleProduct) throw new Error("Sale product not found");
		if (saleProduct.sale.status !== "OPEN") {
			throw new Error("Can only update products in OPEN sales");
		}

		await this.storeService.verifyStoreAccess(saleProduct.sale.storeId, user);
		if (user.role === "worker" && saleProduct.sale.workerId !== user.id) {
			throw new Error("Workers can only modify their own sales");
		}

		const updates: any = {};
		let priceChange = 0;
		let stockChange = 0;

		if (input.quantity !== undefined) {
			const oldQuantity = saleProduct.quantity;
			const quantityDiff = input.quantity - oldQuantity;

			if (quantityDiff > 0 && saleProduct.product.quantity < quantityDiff) {
				throw new Error("Insufficient product quantity");
			}

			updates.quantity = input.quantity;
			priceChange = saleProduct.product.price * quantityDiff;
			stockChange = -quantityDiff; // Negative because we're using more stock
		}

		if (input.modifiers !== undefined) {
			updates.modifiers = input.modifiers;
		}

		// Use transaction for all database operations
		const updatedSaleProduct = await this.prisma.$transaction(async (tx) => {
			const updated = await tx.saleProduct.update({
				where: { id },
				data: updates,
				include: {
					product: {
						select: {
							id: true,
							title: true,
							description: true,
							price: true,
							medias: {
								select: { url: true },
							},
						},
					},
				},
			});

			// Update sale total if quantity changed
			if (priceChange !== 0) {
				await tx.sale.update({
					where: { id: saleProduct.saleId },
					data: {
						totalAmount: { increment: priceChange },
					},
				});
			}

			// Update product stock if quantity changed
			if (stockChange !== 0) {
				await tx.product.update({
					where: { id: saleProduct.productId },
					data: {
						quantity: { increment: stockChange },
					},
				});
			}

			return updated;
		});

		const updatedSale = await this.findOne(saleProduct.saleId, user);
		await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, {
			saleUpdated: updatedSale,
		});

		return updatedSaleProduct;
	}

	async removeSaleProduct(id: string, user: AuthPayload) {
		const saleProduct = await this.prisma.saleProduct.findUnique({
			where: { id },
			include: {
				sale: { include: { store: true } },
				product: { select: { price: true } },
			},
		});

		if (!saleProduct) throw new Error("Sale product not found");
		if (saleProduct.sale.status !== "OPEN") {
			throw new Error("Can only remove products from OPEN sales");
		}

		await this.storeService.verifyStoreAccess(saleProduct.sale.storeId, user);
		if (user.role === "worker" && saleProduct.sale.workerId !== user.id) {
			throw new Error("Workers can only modify their own sales");
		}

		// Use transaction for all database operations
		await this.prisma.$transaction(async (tx) => {
			// Remove from sale
			await tx.saleProduct.delete({
				where: { id },
			});

			// Update sale total
			const priceReduction = saleProduct.product.price * saleProduct.quantity;
			await tx.sale.update({
				where: { id: saleProduct.saleId },
				data: {
					totalAmount: {
						decrement: priceReduction,
					},
				},
			});

			// Restore product stock
			await tx.product.update({
				where: { id: saleProduct.productId },
				data: {
					quantity: {
						increment: saleProduct.quantity,
					},
				},
			});
		});

		const updatedSale = await this.findOne(saleProduct.saleId, user);
		await this.pubSub.publish(`sale_updated_${updatedSale.storeId}`, {
			saleUpdated: updatedSale,
		});

		return { id };
	}

	// async completeSale(
	// 	id: string,
	// 	paymentMethod: PaymentMethod,
	// 	user: AuthPayload,
	// ) {
	// 	return this.close(
	// 		{
	// 			saleId: id,
	// 			paymentMethod,
	// 			status: "COMPLETED",
	// 		},
	// 		user,
	// 	);
	// }
}
