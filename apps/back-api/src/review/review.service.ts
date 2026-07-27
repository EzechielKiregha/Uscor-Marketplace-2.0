import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewInput } from "./dto/create-review.input";
import { UpdateReviewInput } from "./dto/update-review.input";

@Injectable()
export class ReviewService {
	constructor(private readonly prisma: PrismaService) {}

	async create(input: CreateReviewInput) {
		return this.prisma.review.create({
			data: {
				clientId: input.clientId,
				productId: input.productId,
				rating: input.rating,
				comment: input.comment,
			},
			include: {
				client: true,
				product: true,
			},
		});
	}

	findAll() {
		return this.prisma.review.findMany({
			include: {
				client: true,
				product: true,
			},
		});
	}

	findOne(id: string) {
		return this.prisma.review.findUnique({
			where: { id },
			include: {
				client: true,
				product: true,
			},
		});
	}

	update(id: string, input: UpdateReviewInput) {
		return this.prisma.review.update({
			where: { id },
			data: {
				...(input.rating !== undefined && { rating: input.rating }),
				...(input.comment !== undefined && { comment: input.comment }),
			},
			include: {
				client: true,
				product: true,
			},
		});
	}

	remove(id: string) {
		return this.prisma.review.delete({
			where: { id },
		});
	}
}
