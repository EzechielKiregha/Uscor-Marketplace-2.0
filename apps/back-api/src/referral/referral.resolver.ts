import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReferralService } from './referral.service';
import { ReferralEntity } from './entities/referral.entity';

@Resolver(() => ReferralEntity)
export class ReferralResolver {
  constructor(private readonly referralService: ReferralService) {}
}
