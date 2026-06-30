import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletSecurityService {
	constructor(private prisma: PrismaService) {}

	async getAuditLogs(
		userId: string,
		userRole: string,
		action?: string,
		page = 1,
		limit = 20,
	) {
		const ownerWhere =
			userRole === "business"
				? { businessId: userId }
				: { clientId: userId };

		const where: any = {
			...ownerWhere,
			...(action ? { action } : {}),
		};

		const [items, total] = await Promise.all([
			this.prisma.walletAuditLog.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.walletAuditLog.count({ where }),
		]);

		return { items, total, page, limit };
	}

	async getLedgerEntries(
		userId: string,
		userRole: string,
		type?: string,
		page = 1,
		limit = 20,
	) {
		const ownerWhere =
			userRole === "business"
				? { businessId: userId }
				: { clientId: userId };

		const where: any = {
			...ownerWhere,
			...(type ? { type } : {}),
		};

		const [items, total] = await Promise.all([
			this.prisma.ledgerEntry.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.ledgerEntry.count({ where }),
		]);

		return { items, total, page, limit };
	}

	async getWalletSecuritySummary(userId: string, userRole: string) {
		const ownerWhere =
			userRole === "business"
				? { businessId: userId }
				: { clientId: userId };

		const [totalAuditLogs, recentAuditLogs, totalLedgerEntries] =
			await Promise.all([
				this.prisma.walletAuditLog.count({ where: ownerWhere }),
				this.prisma.walletAuditLog.findMany({
					where: ownerWhere,
					take: 5,
					orderBy: { createdAt: "desc" },
				}),
				this.prisma.ledgerEntry.count({ where: ownerWhere }),
			]);

		return {
			totalAuditLogs,
			totalLedgerEntries,
			recentActivity: recentAuditLogs,
		};
	}
}
