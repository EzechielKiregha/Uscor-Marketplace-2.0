import { Inject } from "@nestjs/common";
import {
	Args,
	Int,
	Mutation,
	Query,
	Resolver,
	Subscription,
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { KycStatus } from "../business/dto/update-business.input";
import { UpdatePlatformSettingsInput } from "./dto/update-platform-settings.input";
import { KycSubmissionPagination } from "./entities/kyc-submission.entity";
import { PlatformMetrics } from "./entities/platform-metrics.entity";
import { PlatformSettings } from "./entities/platform-settings.entity";
import { TokenReconciliation } from "./entities/token-reconciliation.entity";
import { PlatformService } from "./platform.service";

@Resolver()
export class PlatformResolver {
	constructor(
		private readonly platformService: PlatformService,
		@Inject("PUB_SUB")
		private readonly pubSub: PubSub,
	) {}

	@Query(() => PlatformMetrics)
	async platformMetrics() {
		return this.platformService.getPlatformMetrics();
	}

	@Query(() => PlatformSettings)
	async platformSettings() {
		return this.platformService.getPlatformSettings();
	}

	@Query(() => KycSubmissionPagination)
	async kycSubmissions(
		@Args("search", { type: () => String, nullable: true })
		search?: string,
		@Args("status", { type: () => KycStatus, nullable: true })
		status?: KycStatus,
		@Args("businessType", { type: () => String, nullable: true })
		businessType?: string,
		@Args("page", { type: () => Int, defaultValue: 1 })
		page?: number,
		@Args("limit", { type: () => Int, defaultValue: 10 })
		limit?: number,
	) {
		return this.platformService.getKycSubmissions(
			search,
			status,
			businessType,
			page,
			limit,
		);
	}

	@Query(() => TokenReconciliation)
	async tokenReconciliation() {
		return this.platformService.getTokenReconciliation();
	}

	@Mutation(() => PlatformSettings)
	async updatePlatformSettings(
		@Args("input")
		input: UpdatePlatformSettingsInput,
	) {
		return this.platformService.updatePlatformSettings(input);
	}

	@Subscription(() => PlatformSettings, {
		resolve: (payload) => payload.platformSettingsUpdated,
	})
	platformSettingsUpdated() {
		return this.pubSub.asyncIterableIterator("PLATFORM_SETTINGS_UPDATED");
	}
}
