import { Resolver, Query, Mutation, Args, Subscription, Int } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { AnnouncementService } from './announcement.service'
import { CreateAnnouncementInput } from './dto/create-announcement.input'
import { PubSub } from 'graphql-subscriptions'
import { AnnouncementEntity, PaginatedAnnouncementsResponse } from './entities/announcement.entity'

@Resolver()
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService, @Inject('PUB_SUB') private pubSub: PubSub) {}

  @Query(() => PaginatedAnnouncementsResponse)
  async announcements(
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('priority', { type: () => String, nullable: true }) priority?: string,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit?: number,
  ) {
    const safePage = Math.max(1, Math.floor(page ?? 1))
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit ?? 10)))
    return this.announcementService.findAll({ status, priority, search, page: safePage, limit: safeLimit })
  }

  @Mutation(() => AnnouncementEntity)
  async createAnnouncement(@Args('input') input: CreateAnnouncementInput) {
    return this.announcementService.create(input)
  }

  @Subscription(() => AnnouncementEntity, {
    resolve: (payload) => payload.newAnnouncement,
  })
  newAnnouncement() {
    return this.pubSub.asyncIterableIterator('NEW_ANNOUNCEMENT')
  }
}
