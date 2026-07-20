import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SettlementService {
	private readonly logger = new Logger(SettlementService.name);

	constructor(private prisma: PrismaService) {}

	async findAll(
		page: number = 1,
		limit: number = 20,
		status?: string,
		businessId?: string,
	) {
		const skip = (page - 1) * limit;
		const where: any = {};
		if (status) where.status = status;
		if (businessId) where.businessId = businessId;

		const [items, total] = await Promise.all([
			this.prisma.platformSettlement.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					business: {
						select: { id: true, name: true, avatar: true },
					},
				},
			}),
			this.prisma.platformSettlement.count({ where }),
		]);

		return { items, total, page, limit };
	}

	async findByBusiness(
		businessId: string,
		page: number = 1,
		limit: number = 20,
		status?: string,
	) {
		return this.findAll(page, limit, status, businessId);
	}

	async distribute(id: string, adminId: string) {
		const settlement = await this.prisma.platformSettlement.findUnique({
			where: { id },
		});
		if (!settlement) throw new Error("Settlement not found");
		if (settlement.status === "DISTRIBUTED") {
			throw new Error("Settlement already distributed");
		}

		return this.prisma.platformSettlement.update({
			where: { id },
			data: {
				status: "DISTRIBUTED",
				distributedAt: new Date(),
				distributedBy: adminId,
			},
			include: {
				business: {
					select: { id: true, name: true, avatar: true },
				},
			},
		});
	}

	async batchDistribute(ids: string[], adminId: string) {
		const results: any = [];
		for (const id of ids) {
			try {
				const result = await this.distribute(id, adminId);
				results.push(result);
			} catch (error) {
				this.logger.warn(`Failed to distribute settlement ${id}`, error);
			}
		}
		return results;
	}

	async getStats(businessId?: string) {
		const where: any = {};
		if (businessId) where.businessId = businessId;

		const [pending, distributed] = await Promise.all([
			this.prisma.platformSettlement.aggregate({
				where: { ...where, status: "PENDING" },
				_sum: { netAmount: true, platformFee: true, deliveryFee: true },
				_count: true,
			}),
			this.prisma.platformSettlement.aggregate({
				where: { ...where, status: "DISTRIBUTED" },
				_sum: { netAmount: true, platformFee: true, deliveryFee: true },
				_count: true,
			}),
		]);

		return {
			totalPending: pending._sum.netAmount || 0,
			totalDistributed: distributed._sum.netAmount || 0,
			totalPlatformFees:
				(pending._sum.platformFee || 0) + (distributed._sum.platformFee || 0),
			totalDeliveryFees:
				(pending._sum.deliveryFee || 0) + (distributed._sum.deliveryFee || 0),
			pendingCount: pending._count,
			distributedCount: distributed._count,
		};
	}
}
