import { Resolver } from "@nestjs/graphql";
import { ReferralEntity } from "./entities/referral.entity";
import type { ReferralService } from "./referral.service";

@Resolver(() => ReferralEntity)
export class ReferralResolver {
	constructor(readonly _referralService: ReferralService) {}
}
