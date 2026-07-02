import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { hash } from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { AddSaleProductInput } from "./dto/add-sale-product.input";
import { CompleteSaleInput } from "./dto/complete-sale.input";
import { CreateInventoryAdjustmentInput } from "./dto/create-inventory-adjustment.input";
import { CreateSaleInput } from "./dto/create-sale.input";
import { type CreateWorkerInput, WorkerRole } from "./dto/create-worker.input";
import { EndWorkerShiftInput } from "./dto/end-shift.input";
import { ProcessMobileMoneyPaymentInput } from "./dto/process-mobile-money.input";
import { SendChatMessageInput } from "./dto/send-chat-message.input";
import { StartShiftInput } from "./dto/start-shift.input";
import { UpdateSaleProductInput } from "./dto/update-sale-product.input";
import { UpdateWorkerInput } from "./dto/update-worker.input";

@Injectable()
export class WorkerService {
	constructor(private prisma: PrismaService) {}

	async create(createWorkerInput: CreateWorkerInput) {
		const { password, businessId, kycId, role, phone, createNewWorker, storeId, ...workerData } =
			createWorkerInput;
		const hashedPassword = await hash(password);

		if (!businessId) throw new UnauthorizedException("Business ID is missing");

        const worker = await this.prisma.worker.create({
			data: {
				...workerData,
				role: role || WorkerRole.STAFF,
				password: hashedPassword,
				phone: phone || Math.random().toString().slice(2, 11), // Generate random 9-digit phone if not provided
				business: {
					connect: { id: businessId },
				},
				stores: createNewWorker ? { connect: { id: storeId } } : undefined,
				kyc: kycId ? { connect: { id: kycId } } : undefined,
			},
			include: {
                business: true,
                stores: true,
				kyc: true,
				shifts: true,
				sales: true,
				medias: true,
				auditLogs: true,
				chatParticipants: {
					include: {
						chat: {
							include: {
								messages: true,
							},
						},
					},
				},
				workerServiceAssignments: {
					include: {
						freelanceService: true,
					},
				},
			},
		});

		return worker
	}

	async findAll(storeId?: string) {
		const whereClause: any = {};

		if (storeId) {
			whereClause.business = {
				stores: {
					some: {
						id: storeId,
					},
				},
			};
		}

		return await this.prisma.worker.findMany({
			where: whereClause,
			include: {
				business: true,
				kyc: true,
				workerServiceAssignments: {
					include: {
						freelanceService: true,
					},
				},
				chatParticipants: true,
				sales: true,
				shifts: true,
				medias: true,
				auditLogs: true,
			},
		});
	}

	async findOne(id: string) {
		const worker = await this.prisma.worker.findUnique({
			where: { id },
			include: {
				business: {
					include: {
						stores: true,
					},
				},
                stores: true,
				kyc: true,
				workerServiceAssignments: {
					include: {
						freelanceService: true,
					},
				},
				chatParticipants: {
					include: {
						chat: {
							include: {
								messages: true,
							},
						},
					},
				},
				sales: {
					include: {
						saleProducts: {
							include: {
								product: true,
							},
						},
						client: true,
						store: true,
					},
				},
				shifts: {
					include: {
						store: true,
					},
				},
				medias: true,
				auditLogs: true,
			},
		});

		if (!worker) {
			throw new NotFoundException(`Worker with ID ${id} not found`);
		}

		return worker;
	}
    
	async findOneByEmain(email: string) {
		const worker = await this.prisma.worker.findUnique({
			where: { email: email },
			include: {
				business: {
					include: {
						stores: true,
					},
				},
                stores: true,
				kyc: true,
				workerServiceAssignments: {
					include: {
						freelanceService: true,
					},
				},
				chatParticipants: {
					include: {
						chat: {
							include: {
								messages: true,
							},
						},
					},
				},
				sales: {
					include: {
						saleProducts: {
							include: {
								product: true,
							},
						},
						client: true,
						store: true,
					},
				},
				shifts: {
					include: {
						store: true,
					},
				},
				medias: true,
				auditLogs: true,
			},
		});

		if (!worker) {
			return null;
		}

		return worker;
	}

	async update(id: string, updateWorkerInput: UpdateWorkerInput) {
		const { password, businessId, kycId, ...updateData } = updateWorkerInput;

		const data: any = { ...updateData };
		if (password) {
			data.password = await hash(password);
		}
		if (businessId) {
			data.business = {
				connect: { id: businessId },
			};
		}
		if (kycId) {
			data.kyc = { connect: { id: kycId } };
		}

		return this.prisma.worker.update({
			where: { id },
			data,
			include: {
				business: true,
				kyc: true,
				shifts: true,
				sales: true,
				medias: true,
				auditLogs: true,
				chatParticipants: {
					include: {
						chat: {
							include: {
								messages: true,
							},
						},
					},
				},
				workerServiceAssignments: {
					include: {
						freelanceService: true,
					},
				},
			},
		});
	}

	async remove(id: string) {
		return this.prisma.worker.delete({
			where: { id },
			include: {
				business: true,
			},
		});
	}

	// ============================================
	// DASHBOARD & STATS
	// ============================================

	async getDashboard(workerId: string, storeId: string) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const todaySales = await this.prisma.sale.aggregate({
			where: {
				workerId,
				storeId,
				createdAt: { gte: today },
				status: "COMPLETED",
			},
			_sum: { totalAmount: true },
		});

		const todayOrders = await this.prisma.sale.count({
			where: {
				workerId,
				storeId,
				createdAt: { gte: today },
				status: "COMPLETED",
			},
		});

		const currentShift = await this.prisma.shift.findFirst({
			where: {
				workerId,
				storeId,
				endTime: null,
			},
		});

		const activeChats = await this.prisma.chat.count({
			where: {
				status: "ACTIVE",
			},
		});

		const lowStockItems = await this.prisma.inventoryAdjustment.count({
			where: {
				storeId,
			},
		});

		const thisWeekStart = new Date(today);
		thisWeekStart.setDate(thisWeekStart.getDate() - 7);

		const salesThisWeek = await this.prisma.sale.aggregate({
			where: {
				workerId,
				createdAt: { gte: thisWeekStart },
				status: "COMPLETED",
			},
			_sum: { totalAmount: true },
		});

		const thisMonthStart = new Date(today);
		thisMonthStart.setDate(1);

		const salesThisMonth = await this.prisma.sale.aggregate({
			where: {
				workerId,
				createdAt: { gte: thisMonthStart },
				status: "COMPLETED",
			},
			_sum: { totalAmount: true },
		});

		const topSellingProducts = await this.prisma.saleProduct.findMany({
			where: {
				sale: {
					workerId,
					storeId,
					status: "COMPLETED",
				},
			},
			include: { product: true },
			take: 5,
		});

		const recentOrders = await this.prisma.sale.findMany({
			where: {
				workerId,
				storeId,
				status: "COMPLETED",
			},
			include: {
				client: true,
			},
			orderBy: { createdAt: "desc" },
			take: 5,
		});

        console.log({
			todaySales: todaySales._sum.totalAmount || 0,
			todayOrders,
			lowStockItems,
			activeChats,
			currentShift,
			salesThisWeek: salesThisWeek._sum.totalAmount || 0,
			salesThisMonth: salesThisMonth._sum.totalAmount || 0,
			topSellingProducts,
			recentOrders,
			workerPerformance: {
				totalSales: salesThisMonth._sum.totalAmount || 0,
				totalTransactions: await this.prisma.sale.count({
					where: { workerId },
				}),
				customerSatisfaction: 4.5,
				attendanceRate: 95,
				shiftsCompleted: await this.prisma.shift.count({
					where: {
						workerId,
						endTime: { not: null },
					},
				}),
				personalSales: todaySales._sum.totalAmount || 0,
			},
		})

		return {
			todaySales: todaySales._sum.totalAmount || 0,
			todayOrders,
			lowStockItems,
			activeChats,
			currentShift,
			salesThisWeek: salesThisWeek._sum.totalAmount || 0,
			salesThisMonth: salesThisMonth._sum.totalAmount || 0,
			topSellingProducts,
			recentOrders,
			workerPerformance: {
				totalSales: salesThisMonth._sum.totalAmount || 0,
				totalTransactions: await this.prisma.sale.count({
					where: { workerId },
				}),
				customerSatisfaction: 4.5,
				attendanceRate: 95,
				shiftsCompleted: await this.prisma.shift.count({
					where: {
						workerId,
						endTime: { not: null },
					},
				}),
				personalSales: todaySales._sum.totalAmount || 0,
			},
		};
	}

	async getDashboardStats(workerId: string, storeId: string) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const todaySales = await this.prisma.sale.aggregate({
			where: {
				workerId,
				storeId,
				createdAt: { gte: today },
				status: "COMPLETED",
			},
			_sum: { totalAmount: true },
		});

		const todayTransactions = await this.prisma.sale.count({
			where: {
				workerId,
				storeId,
				createdAt: { gte: today },
				status: "COMPLETED",
			},
		});

		const currentShift = await this.prisma.shift.findFirst({
			where: {
				workerId,
				storeId,
				endTime: null,
			},
		});

		const lowStockProducts = await this.prisma.inventoryAdjustment.count({
			where: {
				storeId,
			},
		});

		const upcomingChats = await this.prisma.chat.count({
			where: {
				status: "PENDING",
			},
		});

		let currentShiftSales = 0;
		let currentShiftDuration = 0;

		if (currentShift) {
			const shiftSales = await this.prisma.sale.aggregate({
				where: {
					workerId,
					storeId,
					createdAt: {
						gte: currentShift.startTime,
					},
					status: "COMPLETED",
				},
				_sum: { totalAmount: true },
			});
			currentShiftSales = shiftSales._sum.totalAmount || 0;
			currentShiftDuration = Math.floor(
				(Date.now() - currentShift.startTime.getTime()) / 1000 / 60,
			);
		}

		return {
			todaySales: todaySales._sum.totalAmount || 0,
			todayTransactions,
			currentShiftSales,
			currentShiftDuration,
			lowStockProducts,
			upcomingChats,
		};
	}

	// ============================================
	// SALES MANAGEMENT
	// ============================================

	async createSale(input: CreateSaleInput) {
		return this.prisma.sale.create({
			data: input,
			include: {
				saleProducts: {
					include: { product: true },
				},
				client: true,
				worker: true,
				store: true,
			},
		});
	}

	async getSalesByWorker(
		workerId: string,
		storeId?: string,
		status?: string,
		startDate?: Date,
		endDate?: Date,
		page: number = 1,
		limit: number = 20,
	) {
		const where: any = { workerId };

		if (storeId) where.storeId = storeId;
		if (status) where.status = status;
		if (startDate || endDate) {
			where.createdAt = {};
			if (startDate) where.createdAt.gte = startDate;
			if (endDate) where.createdAt.lte = endDate;
		}

		const total = await this.prisma.sale.count({
			where,
		});
		const items = await this.prisma.sale.findMany({
			where,
			include: {
				saleProducts: {
					include: { product: true },
				},
				client: true,
				worker: true,
				store: true,
			},
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
		});

		return {
			items,
			total,
			page,
			limit,
		};
	}

	async getCurrentSale(workerId: string, storeId: string) {
		return this.prisma.sale.findFirst({
			where: {
				workerId,
				storeId,
				status: "OPEN",
			},
			include: {
				saleProducts: {
					include: { product: true },
				},
				client: true,
				worker: true,
				store: true,
				returns: true,
			},
		});
	}

	async addSaleProduct(input: AddSaleProductInput) {
		return this.prisma.saleProduct.create({
			data: input,
			include: {
				product: true,
			},
		});
	}

	async updateSaleProduct(id: string, input: UpdateSaleProductInput) {
		return this.prisma.saleProduct.update({
			where: { id },
			data: input,
			include: {
				product: true,
			},
		});
	}

	async removeSaleProduct(id: string) {
		return this.prisma.saleProduct.delete({
			where: { id },
		});
	}

	async completeSale(input: CompleteSaleInput) {
		return this.prisma.sale.update({
			where: { id: input.id },
			data: {
				status: "COMPLETED",
				paymentMethod: input.paymentMethod,
			},
			include: {
				saleProducts: {
					include: { product: true },
				},
				client: true,
				worker: true,
				store: true,
			},
		});
	}

	// ============================================
	// INVENTORY MANAGEMENT
	// ============================================

	async getInventory(
		storeId: string,
		productId?: string,
		_lowStockOnly?: boolean,
		page: number = 1,
		limit: number = 20,
	) {
		const where: any = { storeId };

		if (productId) where.productId = productId;

		const total = await this.prisma.inventoryAdjustment.count({
			where,
		});

		const items = await this.prisma.inventoryAdjustment.findMany({
			where,
			include: {
				product: true,
			},
			skip: (page - 1) * limit,
			take: limit,
		});

		return {
			items,
			total,
			page,
			limit,
		};
	}

	async createInventoryAdjustment(input: CreateInventoryAdjustmentInput) {

        const {productId, storeId, adjustmentType, quantity, reason} = input
        let adjustment

        if (!productId || !storeId) throw new Error("Store ID or Product ID is missing.")
            
            const product =
              await this.prisma.product.findUnique(
                { where: { id: productId } },
              )

            if (!product)
              throw new Error('Product not found')

            if (product.storeId !== storeId) {
              throw new Error(
                `Product ${productId} does not belong to store ${storeId}`,
              )
            }

            if (
              adjustmentType === 'REMOVE' &&
              product.quantity < quantity
            ) {
              throw new Error(
                `Insufficient stock for product ${productId}`,
              )
            }
            
            await this.prisma.$transaction(async (tx) => {
                adjustment =
                  tx.inventoryAdjustment.create(
                    {
                      data: {
                        quantity,
                        adjustmentType,
                        reason,
                        product: {
                          connect: { id: productId },
                        },
                        store: {
                          connect: { id: storeId },
                        },
                      },
                      include: {
                        product: true,
                        store: true,
                      },
                    },
                  )
                  await tx.product.update({
                    where: {
                      id: product.id,
                    },
                    data: {
                      quantity:
                        adjustmentType === 'ADD'
                          ? {
                              increment: quantity,
                            }
                          : {
                              decrement: quantity,
                            },
                    },
                  })
            })

		return adjustment
	}

	// ============================================
	// SHIFT MANAGEMENT
	// ============================================

	async startShift(input: StartShiftInput) {
		return this.prisma.shift.create({
			data: input,
			include: {
				worker: true,
				store: true,
			},
		});
	}

	async endShift(input: EndWorkerShiftInput) {
		return this.prisma.shift.update({
			where: { id: input.id },
			data: {
				endTime: new Date(),
				sales: input.sales,
			},
			include: {
				worker: true,
				store: true,
			},
		});
	}

	async getShiftsByWorker(
		workerId: string,
		storeId?: string,
		startDate?: Date,
		endDate?: Date,
		page: number = 1,
		limit: number = 20,
	) {
		const where: any = { workerId };

		if (storeId) where.storeId = storeId;
		if (startDate || endDate) {
			where.createdAt = {};
			if (startDate) where.createdAt.gte = startDate;
			if (endDate) where.createdAt.lte = endDate;
		}

		const total = await this.prisma.shift.count({
			where,
		});
		const items = await this.prisma.shift.findMany({
			where,
			include: {
				worker: true,
				store: true,
			},
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
		});

		return {
			items,
			total,
			page,
			limit,
		};
	}

	async getCurrentShift(workerId: string, storeId: string) {
		return this.prisma.shift.findFirst({
			where: {
				workerId,
				storeId,
				endTime: null,
			},
			include: {
				worker: true,
				store: true,
			},
		});
	}

	// ============================================
	// CHAT MANAGEMENT
	// ============================================

	async getChatsByWorker(
		_workerId: string,
		page: number = 1,
		limit: number = 20,
	) {
		const total = await this.prisma.chat.count();

		const items = await this.prisma.chat.findMany({
			include: {
				messages: true,
				participants: {
					include: {
						business: true,
						client: true,
					},
				},
			},
			skip: (page - 1) * limit,
			take: limit,
		});

		return {
			items,
			total,
			page,
			limit,
		};
	}

	async sendChatMessage(input: SendChatMessageInput) {
		return this.prisma.chatMessage.create({
			data: input,
		});
	}

	// ============================================
	// PAYMENT PROCESSING
	// ============================================

	async processMobileMoneyPayment(input: ProcessMobileMoneyPaymentInput) {
		const transactionId = `TXN_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		await this.prisma.sale.update({
			where: { id: input.saleId },
			data: {
				status: "COMPLETED",
				paymentMethod: "MOBILE_MONEY",
			},
		});

		return {
			success: true,
			transactionId,
			status: "PENDING",
			ussdCode: `*123*${Math.random().toString(36).substr(2, 5)}#`,
		};
	}
}
