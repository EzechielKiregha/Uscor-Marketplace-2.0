import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { PlatformService } from './platform.service'
import { PlatformSettings } from './entities/platform-settings.entity'
import { UpdatePlatformSettingsInput } from './dto/update-platform-settings.input'
import { PlatformMetrics } from './entities/platform-metrics.entity'
import { PubSub } from 'graphql-subscriptions'

@Resolver()
export class PlatformResolver {
  constructor(
    private readonly platformService: PlatformService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => PlatformMetrics)
  async platformMetrics() {
    return this.platformService.getPlatformMetrics()
  }

  @Query(() => PlatformSettings)
  async platformSettings() {
    return this.platformService.getPlatformSettings()
  }

  @Mutation(() => PlatformSettings)
  async updatePlatformSettings(@Args('input') input: UpdatePlatformSettingsInput) {
    return this.platformService.updatePlatformSettings(input)
  }

  @Subscription(() => PlatformSettings, {
    resolve: (payload) => payload.platformSettingsUpdated,
  })
  platformSettingsUpdated() {
    return this.pubSub.asyncIterableIterator('PLATFORM_SETTINGS_UPDATED')
  }
}
