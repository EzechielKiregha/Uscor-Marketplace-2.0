import { Inject, Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PusherService } from "../chat/pusher.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAnnouncementInput } from "./dto/create-announcement.input";

@Injectable()
export class AnnouncementService {
	constructor(
		private prisma: PrismaService,
		@Inject("PUB_SUB") private pubSub: PubSub,
		private pusherService: PusherService,
	) {}

	async create(input: CreateAnnouncementInput) {
		const announcement = await (this.prisma as any).announcement.create({
			data: { ...input },
		});
		// publish via GraphQL subscriptions
		await this.pubSub.publish("NEW_ANNOUNCEMENT", {
			newAnnouncement: announcement,
		});
		// Push to all connected browsers via Pusher
		try {
			await this.pusherService.trigger(
				"platform-announcements",
				"new-announcement",
				{
					id: announcement.id,
					title: announcement.title,
					content: announcement.content,
					priority: announcement.priority,
					createdAt: announcement.createdAt,
				},
			);
		} catch (error) {
			console.warn("Failed to send Pusher announcement notification", error);
		}
		return announcement;
	}

	async findAll({ page = 1, limit = 10, status, priority, search }: any) {
		const where: any = {};
		if (status) where.status = status;
		if (priority) where.priority = priority;
		if (search)
			where.OR = [
				{
					title: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					content: {
						contains: search,
						mode: "insensitive",
					},
				},
			];

		const [items, total] = await Promise.all([
			(this.prisma as any).announcement.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			(this.prisma as any).announcement.count({
				where,
			}),
		]);

		return { items, total, page, limit };
	}
}
