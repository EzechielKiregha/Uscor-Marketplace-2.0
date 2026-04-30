import { Resolver } from "@nestjs/graphql";
import { ReviewEntity } from "./entities/review.entity";
import { ReviewService } from "./review.service";

@Resolver(() => ReviewEntity)
export class ReviewResolver {
	constructor(readonly _reviewService: ReviewService) {}
}
