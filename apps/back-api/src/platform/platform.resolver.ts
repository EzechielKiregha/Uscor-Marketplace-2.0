import { Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import type { PubSub } from "graphql-subscriptions";
import type { UpdatePlatformSettingsInput } from "./dto/update-platform-settings.input";
import { PlatformMetrics } from "./entities/platform-metrics.entity";
import { PlatformSettings } from "./entities/platform-settings.entity";
import type { PlatformService } from "./platform.service";

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
