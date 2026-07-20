import { Inject, Injectable, Logger } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PusherService } from "../chat/pusher.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DisputeService {
	private readonly logger = new Logger(DisputeService.name);

	constructor(
		private prisma: PrismaService,
		@Inject("PUB_SUB") private pubSub: PubSub,
		private pusherService: PusherService,
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
		// Notify admin dashboard via Pusher
		try {
			await this.pusherService.trigger(
				"admin-disputes",
				"new-dispute",
				{
					id: dispute.id,
					title: dispute.title,
					type: dispute.type,
					status: dispute.status,
					createdAt: dispute.createdAt,
				},
			);
		} catch (error) {
			this.logger.warn("Failed to send Pusher dispute notification", error);
		}
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
		// Notify parties via Pusher (businessId and clientId are on the dispute model if available)
		try {
			if (dispute.businessId) {
				await this.pusherService.trigger(
					`business-${dispute.businessId}`,
					"dispute-update",
					{
						id: dispute.id,
						status: "RESOLVED",
						resolutionNotes,
						refundAmount,
						compensation,
						message: `Dispute "${dispute.title}" has been resolved.`,
					},
				);
			}
			if (dispute.clientId) {
				await this.pusherService.trigger(
					`client-${dispute.clientId}`,
					"dispute-update",
					{
						id: dispute.id,
						status: "RESOLVED",
						resolutionNotes,
						refundAmount,
						compensation,
						message: `Your dispute "${dispute.title}" has been resolved.`,
					},
				);
			}
		} catch (error) {
			this.logger.warn("Failed to send Pusher dispute resolution notification", error);
		}
		return dispute;
	}
}
