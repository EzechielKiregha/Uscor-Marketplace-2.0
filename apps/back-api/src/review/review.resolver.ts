import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewService } from './review.service';
import { ReviewEntity } from './entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';

@Resolver(() => ReviewEntity)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}
}
