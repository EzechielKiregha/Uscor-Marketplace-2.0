import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateReviewInput } from "./dto/create-review.input";
import { UpdateReviewInput } from "./dto/update-review.input";
import { ReviewEntity } from "./entities/review.entity";
import { ReviewService } from "./review.service";

@Resolver(() => ReviewEntity)
export class ReviewResolver {
	constructor(private readonly reviewService: ReviewService) {}

	@Mutation(() => ReviewEntity)
	async createReview(
		@Args("createReviewInput") createReviewInput: CreateReviewInput,
	) {
		return this.reviewService.create(createReviewInput);
	}

	@Query(() => [ReviewEntity], { name: "reviews" })
	async findAll() {
		return this.reviewService.findAll();
	}

	@Query(() => ReviewEntity, { name: "review", nullable: true })
	async findOne(@Args("id") id: string) {
		return this.reviewService.findOne(id);
	}

	@Mutation(() => ReviewEntity)
	async updateReview(
		@Args("id") id: string,
		@Args("updateReviewInput") updateReviewInput: UpdateReviewInput,
	) {
		return this.reviewService.update(id, updateReviewInput);
	}

	@Mutation(() => ReviewEntity)
	async deleteReview(@Args("id") id: string) {
		return this.reviewService.remove(id);
	}
}
