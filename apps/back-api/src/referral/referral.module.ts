import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ReferralResolver } from './referral.resolver';

@Module({
  providers: [ReferralResolver, ReferralService],
})
export class ReferralModule {}
