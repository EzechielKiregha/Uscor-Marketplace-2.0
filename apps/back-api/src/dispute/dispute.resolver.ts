import { Resolver, Query, Mutation, Args, Subscription, Int } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { DisputeService } from './dispute.service'
import { PubSub } from 'graphql-subscriptions'
import { DisputeEntity, PaginatedDisputesResponse } from './entities/dispute.entity'

@Resolver()
export class DisputeResolver {
  constructor(private disputeService: DisputeService, @Inject('PUB_SUB') private pubSub: PubSub) {}

  @Query(() => PaginatedDisputesResponse)
  async disputes(
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit?: number,
  ) {
    // sanitize pagination args
    const safePage = Math.max(1, Math.floor(page ?? 1))
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit ?? 10)))
    return this.disputeService.findAll({ status, type, search, page: safePage, limit: safeLimit })
  }

  @Mutation(() => DisputeEntity)
  async resolveDispute(
    @Args('disputeId') disputeId: string,
    @Args('resolutionNotes') resolutionNotes: string,
    @Args('refundAmount', { nullable: true }) refundAmount: number,
    @Args('compensation', { nullable: true }) compensation: number,
  ) {
    return this.disputeService.resolveDispute(disputeId, resolutionNotes, refundAmount, compensation)
  }

  @Subscription(() => DisputeEntity, {
    resolve: (payload) => payload.newDispute,
  })
  newDispute() {
    return this.pubSub.asyncIterableIterator('NEW_DISPUTE')
  }
}
