import { Injectable } from "@nestjs/common";
import { BusinessService } from "../business/business.service";
import { ClientService } from "../client/client.service";
import { PrismaService } from "../prisma/prisma.service";
import {
	CreateLoyaltyProgramInput,
	CreateLoyaltyTierInput,
	CreatePointsTransactionInput,
	EarnPointsInput,
	RedeemPointsInput,
	UpdateLoyaltyTierInput,
} from "./dto/loyalty-program.input";
import { UpdateLoyaltyProgramInput } from "./dto/update-loyalty-program.input";

// Service
@Injectable()
export class LoyaltyService {
	constructor(
		public prisma: PrismaService,
		private businessService: BusinessService,
		private clientService: ClientService,
	) {}

	async createLoyaltyProgram(
		input: CreateLoyaltyProgramInput,
		user: { id: string; role: string },
	) {
		const {
			businessId,
			name,
			description,
			pointsPerPurchase,
			minimumPointsToRedeem,
		} = input;

		if (user.role !== "business") {
			throw new Error("Only business owners can create loyalty programs");
		}
		await this.businessService.verifyBusinessAccess(businessId, user);

		return this.prisma.loyaltyProgram.create({
			data: {
				business: { connect: { id: businessId } },
				name,
				description,
				pointsPerPurchase,
				minimumPointsToRedeem,
			},
			include: {
				business: {
					select: {
						id: true,
						name: true,
						businessType: true,
					},
				},
				pointsTransactions: {
					include: {
						client: {
							select: {
								id: true,
								fullName: true,
								email: true,
							},
						},
					},
				},
				tiers: {
					include: { benefits: true },
				},
			},
		});
	}

	async updateLoyaltyProgram(
		id: string,
		input: UpdateLoyaltyProgramInput,
		user: { id: string; role: string },
	) {
		const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
			where: { id },
			include: { business: true },
		});
		if (!loyaltyProgram) {
			throw new Error("Loyalty program not found");
		}
		if (user.role !== "business") {
			throw new Error("Only business owners can update loyalty programs");
		}
		await this.businessService.verifyBusinessAccess(
			loyaltyProgram.businessId,
			user,
		);

		return this.prisma.loyaltyProgram.update({
			where: { id },
			data: {
				name: input.name,
				description: input.description,
				pointsPerPurchase: input.pointsPerPurchase,
				minimumPointsToRedeem: input.minimumPointsToRedeem,
			},
			include: {
				business: {
					select: {
						id: true,
						name: true,
						businessType: true,
					},
				},
				pointsTransactions: {
					include: {
						client: {
							select: {
								id: true,
								fullName: true,
								email: true,
							},
						},
					},
				},
				tiers: {
					include: { benefits: true },
				},
			},
		});
	}

	async createPointsTransaction(
		input: CreatePointsTransactionInput,
		user: { id: string; role: string },
	) {
		const { clientId, loyaltyProgramId, points } = input;

		const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
			where: { id: loyaltyProgramId },
			include: { business: true },
		});
		if (!loyaltyProgram) {
			throw new Error("Loyalty program not found");
		}
		await this.businessService.verifyBusinessAccess(
			loyaltyProgram.businessId,
			user,
		);

		const client = await this.clientService.findOne(clientId);
		if (!client) {
			throw new Error("Client not found");
		}

		return this.prisma.pointsTransaction.create({
			data: {
				client: { connect: { id: clientId } },
				loyaltyProgram: {
					connect: { id: loyaltyProgramId },
				},
				points,
				type: points >= 0 ? "EARNED" : "REDEEMED",
			},
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
						createdAt: true,
					},
				},
				loyaltyProgram: {
					select: {
						id: true,
						name: true,
						pointsPerPurchase: true,
						createdAt: true,
					},
				},
			},
		});
	}

	async getPointsTransactionsByClient(
		clientId: string,
		user: { id: string; role: string },
	) {
		const client = await this.clientService.findOne(clientId);
		if (!client) {
			throw new Error("Client not found");
		}
		// await this.businessService.verifyBusinessAccess(null, user);

		return this.prisma.pointsTransaction.findMany({
			where: { clientId },
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
						createdAt: true,
					},
				},
				loyaltyProgram: {
					select: {
						id: true,
						name: true,
						pointsPerPurchase: true,
						createdAt: true,
					},
				},
			},
		});
	}

	async getPointsTransactionsByProgram(
		loyaltyProgramId: string,
		user: { id: string; role: string },
	) {
		const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
			where: { id: loyaltyProgramId },
			include: { business: true },
		});
		if (!loyaltyProgram) {
			throw new Error("Loyalty program not found");
		}
		await this.businessService.verifyBusinessAccess(
			loyaltyProgram.businessId,
			user,
		);

		return this.prisma.pointsTransaction.findMany({
			where: { loyaltyProgramId },
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
						createdAt: true,
					},
				},
				loyaltyProgram: {
					select: {
						id: true,
						name: true,
						pointsPerPurchase: true,
						createdAt: true,
					},
				},
			},
		});
	}

	async getClientPointsBalance(
		clientId: string,
		user: { id: string; role: string },
	) {
		const client = await this.clientService.findOne(clientId);
		if (!client) {
			throw new Error("Client not found");
		}
		await this.businessService.verifyBusinessAccess(null, user);

		const balance = await this.prisma.pointsTransaction.aggregate({
			where: { clientId },
			_sum: { points: true },
		});

		return {
			clientId,
			client: {
				id: client.id,
				name: client.fullName,
				createdAt: client.createdAt,
			},
			totalPoints: balance._sum.points || 0,
		};
	}

	// New methods to match frontend expectations
	async getLoyaltyPrograms(
		businessId: string,
		user: { id: string; role: string },
	) {
		if (user.role !== "business") {
			throw new Error("Only business owners can view loyalty programs");
		}
		await this.businessService.verifyBusinessAccess(businessId, user);

		return this.prisma.loyaltyProgram.findMany({
			where: { businessId },
			include: {
				business: {
					select: { id: true, name: true, businessType: true },
				},
				pointsTransactions: {
					include: {
						client: {
							select: {
								id: true,
								fullName: true,
								email: true,
							},
						},
					},
				},
				tiers: {
					include: { benefits: true },
				},
			},
		});
	}

	async getLoyaltyProgramById(id: string, user: { id: string; role: string }) {
		const program = await this.prisma.loyaltyProgram.findUnique({
			where: { id },
			include: {
				business: {
					select: { id: true, name: true, businessType: true },
				},
				pointsTransactions: {
					include: {
						client: {
							select: {
								id: true,
								fullName: true,
								email: true,
							},
						},
					},
				},
				tiers: {
					include: { benefits: true },
				},
			},
		});

		if (!program) {
			throw new Error("Loyalty program not found");
		}

		await this.businessService.verifyBusinessAccess(program.businessId, user);
		return program;
	}

	async getCustomerPoints(
		businessId: string,
		clientId: string,
		user: { id: string; role: string },
	) {
		await this.businessService.verifyBusinessAccess(businessId, user);

		const client = await this.clientService.findOne(clientId);
		if (!client) {
			throw new Error("Client not found");
		}

		const program = await this.prisma.loyaltyProgram.findFirst({
			where: { businessId },
			include: {
				tiers: {
					include: { benefits: true },
				},
			},
		});

		if (!program) {
			throw new Error("No loyalty program found for this business");
		}

		const transactions = await this.prisma.pointsTransaction.findMany({
			where: {
				clientId,
				loyaltyProgramId: program.id,
			},
			orderBy: { createdAt: "desc" },
		});

		const totalEarned = transactions
			.filter((t) => t.points > 0)
			.reduce((sum, t) => sum + t.points, 0);
		const totalRedeemed = Math.abs(
			transactions
				.filter((t) => t.points < 0)
				.reduce((sum, t) => sum + t.points, 0),
		);
		const pointsAvailable = totalEarned - totalRedeemed;
		const tier = this.getTierNameForPoints(program.tiers, pointsAvailable);

		return {
			totalPoints: totalEarned,
			pointsUsed: totalRedeemed,
			pointsAvailable,
			tier,
			program: {
				id: program.id,
				name: program.name,
				pointsPerPurchase: program.pointsPerPurchase,
				minimumPointsToRedeem: program.minimumPointsToRedeem,
			},
			transactions: transactions.map((t) => ({
				id: t.id,
				points: t.points,
				createdAt: t.createdAt,
				type: t.points >= 0 ? "EARNED" : "REDEEMED",
			})),
		};
	}

	async getLoyaltyAnalytics(
		businessId: string,
		period: string = "month",
		user: { id: string; role: string },
	) {
		await this.businessService.verifyBusinessAccess(businessId, user);

		const program = await this.prisma.loyaltyProgram.findFirst({
			where: { businessId },
			include: {
				tiers: {
					include: { benefits: true },
				},
			},
		});

		if (!program) {
			return {
				totalMembers: 0,
				activeMembers: 0,
				pointsEarned: 0,
				pointsRedeemed: 0,
				redemptionRate: 0,
				bronzeMembers: 0,
				silverMembers: 0,
				goldMembers: 0,
				platinumMembers: 0,
				topCustomers: [],
				pointsByDay: [],
			};
		}

		const now = new Date();
		const startDate = new Date();
		if (period === "week") {
			startDate.setDate(now.getDate() - 7);
		} else if (period === "month") {
			startDate.setMonth(now.getMonth() - 1);
		} else {
			startDate.setFullYear(now.getFullYear() - 1);
		}

		const transactions = await this.prisma.pointsTransaction.findMany({
			where: {
				loyaltyProgramId: program.id,
				createdAt: { gte: startDate },
			},
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
					},
				},
			},
		});

		const allTransactions = await this.prisma.pointsTransaction.findMany({
			where: { loyaltyProgramId: program.id },
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
					},
				},
			},
		});

		const totalMembers = new Set(allTransactions.map((t) => t.clientId)).size;
		const pointsEarned = transactions
			.filter((t) => t.points > 0)
			.reduce((sum, t) => sum + t.points, 0);
		const pointsRedeemed = Math.abs(
			transactions
				.filter((t) => t.points < 0)
				.reduce((sum, t) => sum + t.points, 0),
		);

		const activeMembers = transactions.length
			? new Set(transactions.map((t) => t.clientId)).size
			: 0;

		const pointsByDayMap = new Map<
			string,
			{ earned: number; redeemed: number }
		>();
		for (const transaction of transactions) {
			const day = transaction.createdAt.toISOString().slice(0, 10);
			if (!pointsByDayMap.has(day)) {
				pointsByDayMap.set(day, { earned: 0, redeemed: 0 });
			}
			const bucket = pointsByDayMap.get(day)!;
			if (transaction.points >= 0) {
				bucket.earned += transaction.points;
			} else {
				bucket.redeemed += Math.abs(transaction.points);
			}
		}

		const pointsByDay: Array<{
			date: string;
			earned: number;
			redeemed: number;
		}> = [];
		const dateCursor = new Date(startDate);
		while (dateCursor <= now) {
			const day = dateCursor.toISOString().slice(0, 10);
			const bucket = pointsByDayMap.get(day) ?? { earned: 0, redeemed: 0 };
			pointsByDay.push({
				date: day,
				earned: bucket.earned,
				redeemed: bucket.redeemed,
			});
			dateCursor.setDate(dateCursor.getDate() + 1);
		}

		const totalPointsByClient = new Map<
			string,
			{
				clientName: string;
				totalPoints: number;
				totalSpent: number;
				netPoints: number;
			}
		>();
		for (const transaction of allTransactions) {
			const existing = totalPointsByClient.get(transaction.clientId) ?? {
				clientName: transaction.client.fullName ?? "",
				totalPoints: 0,
				totalSpent: 0,
				netPoints: 0,
			};
			existing.netPoints += transaction.points;
			if (transaction.points > 0) {
				existing.totalPoints += transaction.points;
				existing.totalSpent += program.pointsPerPurchase
					? transaction.points / program.pointsPerPurchase
					: 0;
			}
			totalPointsByClient.set(transaction.clientId, existing);
		}

		const topCustomers = Array.from(totalPointsByClient.entries())
			.map(([clientId, summary]) => ({
				clientId,
				clientName: summary.clientName,
				totalPoints: summary.totalPoints,
				totalSpent: summary.totalSpent,
			}))
			.sort((a, b) => b.totalPoints - a.totalPoints)
			.slice(0, 5);

		const tierCounts = this.calculateTierCounts(
			program.tiers,
			totalPointsByClient,
		);

		return {
			totalMembers,
			activeMembers,
			pointsEarned,
			pointsRedeemed,
			redemptionRate:
				pointsEarned > 0 ? (pointsRedeemed / pointsEarned) * 100 : 0,
			bronzeMembers: tierCounts.bronze,
			silverMembers: tierCounts.silver,
			goldMembers: tierCounts.gold,
			platinumMembers: tierCounts.platinum,
			topCustomers,
			pointsByDay,
		};
	}

	async earnPoints(input: EarnPointsInput, user: { id: string; role: string }) {
		const { clientId, loyaltyProgramId, points, orderId } = input;

		const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
			where: { id: loyaltyProgramId },
			include: { business: true },
		});

		if (!loyaltyProgram) {
			throw new Error("Loyalty program not found");
		}

		await this.businessService.verifyBusinessAccess(
			loyaltyProgram.businessId,
			user,
		);

		const client = await this.clientService.findOne(clientId);
		if (!client) {
			throw new Error("Client not found");
		}

		return this.prisma.pointsTransaction.create({
			data: {
				client: { connect: { id: clientId } },
				loyaltyProgram: {
					connect: { id: loyaltyProgramId },
				},
				points: Math.abs(points), // Ensure positive for earning
				type: "EARNED",
			},
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
				loyaltyProgram: {
					select: {
						id: true,
						name: true,
						business: {
							select: { id: true, name: true },
						},
					},
				},
			},
		});
	}

	async redeemPoints(
		input: RedeemPointsInput,
		user: { id: string; role: string },
	) {
		const { clientId, loyaltyProgramId, points, rewardDescription } = input;

		const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
			where: { id: loyaltyProgramId },
			include: { business: true },
		});

		if (!loyaltyProgram) {
			throw new Error("Loyalty program not found");
		}

		await this.businessService.verifyBusinessAccess(
			loyaltyProgram.businessId,
			user,
		);

		const client = await this.clientService.findOne(clientId);
		if (!client) {
			throw new Error("Client not found");
		}

		// Check if client has enough points
		const balance = await this.prisma.pointsTransaction.aggregate({
			where: {
				clientId,
				loyaltyProgramId,
			},
			_sum: { points: true },
		});

		const currentPoints = balance._sum.points || 0;
		if (currentPoints < points) {
			throw new Error("Insufficient points for redemption");
		}

		return this.prisma.pointsTransaction.create({
			data: {
				client: { connect: { id: clientId } },
				loyaltyProgram: {
					connect: { id: loyaltyProgramId },
				},
				points: -Math.abs(points), // Negative for redemption
				type: "REDEEMED",
			},
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
				loyaltyProgram: {
					select: {
						id: true,
						name: true,
						business: {
							select: { id: true, name: true },
						},
					},
				},
			},
		});
	}

	private getTierNameForPoints(
		tiers: Array<{ name: string; minPoints: number }> = [],
		points: number,
	) {
		const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
		const found = sortedTiers.find((tier) => points >= tier.minPoints);
		return found?.name ?? null;
	}

	private calculateTierCounts(
		tiers: Array<{ name: string; minPoints: number }> = [],
		clientPoints: Map<string, { netPoints: number }> = new Map(),
	) {
		const counts = {
			bronze: 0,
			silver: 0,
			gold: 0,
			platinum: 0,
		};
		const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
		for (const summary of clientPoints.values()) {
			const tier = sortedTiers.find(
				(tierDef) => summary.netPoints >= tierDef.minPoints,
			);
			if (!tier) {
				continue;
			}
			const name = tier.name.toLowerCase();
			if (name.includes("bronze")) counts.bronze += 1;
			if (name.includes("silver")) counts.silver += 1;
			if (name.includes("gold")) counts.gold += 1;
			if (name.includes("platinum")) counts.platinum += 1;
		}
		return counts;
	}

	async getPointsTransactions(
		loyaltyProgramId: string,
		clientId: string | null,
		type: string | null,
		startDate: Date | null,
		endDate: Date | null,
		page: number,
		limit: number,
		user: { id: string; role: string },
	) {
		const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
			where: { id: loyaltyProgramId },
			include: { business: true },
		});
		if (!loyaltyProgram) {
			throw new Error("Loyalty program not found");
		}
		await this.businessService.verifyBusinessAccess(
			loyaltyProgram.businessId,
			user,
		);

		const where: any = { loyaltyProgramId };
		if (clientId) where.clientId = clientId;
		if (type) where.type = type;
		if (startDate) where.createdAt = { ...where.createdAt, gte: startDate };
		if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

		const total = await this.prisma.pointsTransaction.count({ where });
		const items = await this.prisma.pointsTransaction.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * limit,
			take: limit,
			include: {
				client: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
				loyaltyProgram: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return { items, total, page, limit };
	}

	async getLoyaltyTiers(
		loyaltyProgramId: string,
		user: { id: string; role: string },
	) {
		const program = await this.prisma.loyaltyProgram.findUnique({
			where: { id: loyaltyProgramId },
			include: { business: true },
		});
		if (!program) {
			throw new Error("Loyalty program not found");
		}
		await this.businessService.verifyBusinessAccess(program.businessId, user);

		return this.prisma.loyaltyTier.findMany({
			where: { loyaltyProgramId },
			include: { benefits: true },
		});
	}

	async createLoyaltyTier(
		input: CreateLoyaltyTierInput,
		user: { id: string; role: string },
	) {
		const program = await this.prisma.loyaltyProgram.findUnique({
			where: { id: input.loyaltyProgramId },
			include: { business: true },
		});
		if (!program) {
			throw new Error("Loyalty program not found");
		}
		if (user.role !== "business") {
			throw new Error("Only business owners can create loyalty tiers");
		}
		await this.businessService.verifyBusinessAccess(program.businessId, user);

		return this.prisma.loyaltyTier.create({
			data: {
				loyaltyProgram: { connect: { id: input.loyaltyProgramId } },
				name: input.name,
				minPoints: input.minPoints,
				benefits: {
					create:
						input.benefits?.map((benefit) => ({
							description: benefit.description,
						})) ?? [],
				},
			},
			include: { benefits: true },
		});
	}

	async updateLoyaltyTier(
		input: UpdateLoyaltyTierInput,
		user: { id: string; role: string },
	) {
		const tier = await this.prisma.loyaltyTier.findUnique({
			where: { id: input.id },
			include: { loyaltyProgram: { include: { business: true } } },
		});
		if (!tier) {
			throw new Error("Loyalty tier not found");
		}
		if (user.role !== "business") {
			throw new Error("Only business owners can update loyalty tiers");
		}
		await this.businessService.verifyBusinessAccess(
			tier.loyaltyProgram.businessId,
			user,
		);

		return this.prisma.loyaltyTier.update({
			where: { id: input.id },
			data: {
				name: input.name,
				minPoints: input.minPoints,
				benefits: input.benefits
					? {
							deleteMany: {},
							create: input.benefits.map((benefit) => ({
								description: benefit.description,
							})),
						}
					: undefined,
			},
			include: { benefits: true },
		});
	}

	async deleteLoyaltyTier(id: string, user: { id: string; role: string }) {
		const tier = await this.prisma.loyaltyTier.findUnique({
			where: { id },
			include: { loyaltyProgram: { include: { business: true } } },
		});
		if (!tier) {
			throw new Error("Loyalty tier not found");
		}
		if (user.role !== "business") {
			throw new Error("Only business owners can delete loyalty tiers");
		}
		await this.businessService.verifyBusinessAccess(
			tier.loyaltyProgram.businessId,
			user,
		);

		await this.prisma.loyaltyTierBenefit.deleteMany({
			where: { tierId: id },
		});

		return this.prisma.loyaltyTier.delete({ where: { id } });
	}
}
