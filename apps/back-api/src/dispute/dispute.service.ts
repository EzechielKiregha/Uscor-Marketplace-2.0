import { Inject, Injectable, Logger } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DisputeService {
	private readonly logger = new Logger(DisputeService.name);

	constructor(
		private prisma: PrismaService,
		@Inject("PUB_SUB") private pubSub: PubSub,
	) {}

	async findAll({ status, type, search, page = 1, limit = 10 }: any) {
		const where: any = {};
		if (status) where.status = status;
		if (type) where.type = type;
		if (search)
			where.OR = [
				{
					title: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					description: {
						contains: search,
						mode: "insensitive",
					},
				},
			];

		const [items, total] = await Promise.all([
			(this.prisma as any).dispute.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			(this.prisma as any).dispute.count({
				where,
			}),
		]);
		return { items, total, page, limit };
	}

	async create(data: any) {
		const dispute = await (this.prisma as any).dispute.create({ data });
		await this.pubSub.publish("NEW_DISPUTE", {
			newDispute: dispute,
		});
		return dispute;
	}

	async resolveDispute(
		disputeId: string,
		resolutionNotes: string,
		refundAmount?: number,
		compensation?: number,
	) {
		const dispute = await (this.prisma as any).dispute.update({
			where: { id: disputeId },
			data: {
				status: "RESOLVED",
				resolutionNotes,
				refundAmount,
				compensation,
				resolvedAt: new Date(),
			},
		});
		if (refundAmount && refundAmount > 0) {
			this.logger.warn(
				`Dispute ${disputeId} resolved with refund $${refundAmount} — manual refund processing required`,
			);
		}
		if (compensation && compensation > 0) {
			this.logger.warn(
				`Dispute ${disputeId} resolved with compensation $${compensation} — manual compensation processing required`,
			);
		}

		await this.pubSub.publish("DISPUTE_RESOLVED", { disputeResolved: dispute });
		return dispute;
	}
}
