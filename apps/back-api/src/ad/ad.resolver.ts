import { Resolver } from "@nestjs/graphql";
import type { AdService } from "./ad.service";
import { AdEntity } from "./entities/ad.entity";

@Resolver(() => AdEntity)
export class AdResolver {
	constructor(readonly _adService: AdService) {}
}
