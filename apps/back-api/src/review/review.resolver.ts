import { Resolver } from '@nestjs/graphql';
import { ReviewService } from './review.service';
import { ReviewEntity } from './entities/review.entity';

@Resolver(() => ReviewEntity)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}
}
