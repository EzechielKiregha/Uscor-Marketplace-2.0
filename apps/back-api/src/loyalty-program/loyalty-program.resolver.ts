import { Resolver, Query, Mutation, Args, Int, Context, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { LoyaltyService } from './loyalty-program.service';
import { LoyaltyProgramEntity } from './entities/loyalty-program.entity';
import { CreateLoyaltyProgramInput, CreatePointsTransactionInput, EarnPointsInput, RedeemPointsInput } from './dto/loyalty-program.input';

import { PointsTransactionEntity } from './entities/points-transaction.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateLoyaltyProgramInput } from './dto/update-loyalty-program.input';
import { ClientPointsBalanceEntity } from './entities/client-points-balance.entity';
import { LoyaltyAnalyticsEntity } from './entities/loyalty-analytics.entity';
import { CustomerPointsEntity } from './entities/customer-points.entity';
// Resolver
@Resolver(() => LoyaltyProgramEntity)
export class LoyaltyResolver {
  private pubSub = new PubSub();
  
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => LoyaltyProgramEntity, { description: 'Creates a new loyalty program.' })
  async createLoyaltyProgram(
    @Args('input') input: CreateLoyaltyProgramInput,
    @Context() context,
  ) {
    const program = await this.loyaltyService.createLoyaltyProgram(input, context.req.user);
    
    // Publish to subscribers
    this.pubSub.publish('loyaltyProgramCreated', { 
      loyaltyProgramCreated: program,
      businessId: input.businessId 
    });
    
    return program;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => LoyaltyProgramEntity, { description: 'Updates a loyalty program.' })
  async updateLoyaltyProgram(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateLoyaltyProgramInput,
    @Context() context,
  ) {
    const program = await this.loyaltyService.updateLoyaltyProgram(id, input, context.req.user);
    
    // Publish to subscribers
    this.pubSub.publish('loyaltyProgramUpdated', { 
      loyaltyProgramUpdated: program,
      businessId: program.businessId 
    });
    
    return program;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => PointsTransactionEntity, { description: 'Creates a points transaction.' })
  async createPointsTransaction(
    @Args('createPointsTransactionInput') input: CreatePointsTransactionInput,
    @Context() context,
  ) {
    return this.loyaltyService.createPointsTransaction(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [PointsTransactionEntity], { name: 'pointsTransactionsByClient', description: 'Retrieves points transactions for a client.' })
  async getPointsTransactionsByClient(
    @Args('clientId', { type: () => String }) clientId: string,
    @Context() context,
  ) {
    return this.loyaltyService.getPointsTransactionsByClient(clientId, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [PointsTransactionEntity], { name: 'pointsTransactionsByProgram', description: 'Retrieves points transactions for a loyalty program.' })
  async getPointsTransactionsByProgram(
    @Args('loyaltyProgramId', { type: () => String }) loyaltyProgramId: string,
    @Context() context,
  ) {
    return this.loyaltyService.getPointsTransactionsByProgram(loyaltyProgramId, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => ClientPointsBalanceEntity, { name: 'clientPointsBalance', description: 'Retrieves total points for a client.' })
  async getClientPointsBalance(
    @Args('clientId', { type: () => String }) clientId: string,
    @Context() context,
  ) {
    return this.loyaltyService.getClientPointsBalance(clientId, context.req.user);
  }

  // New resolvers to match frontend expectations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [LoyaltyProgramEntity], { name: 'loyaltyPrograms', description: 'Retrieves loyalty programs for a business.' })
  async getLoyaltyPrograms(
    @Args('businessId', { type: () => String }) businessId: string,
    @Context() context,
  ) {
    return this.loyaltyService.getLoyaltyPrograms(businessId, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => LoyaltyProgramEntity, { name: 'loyaltyProgram', description: 'Retrieves a loyalty program by ID.' })
  async getLoyaltyProgramById(
    @Args('id', { type: () => String }) id: string,
    @Context() context,
  ) {
    return this.loyaltyService.getLoyaltyProgramById(id, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => CustomerPointsEntity, { name: 'customerPoints', description: 'Retrieves customer points and transactions.' })
  async getCustomerPoints(
    @Args('businessId', { type: () => String }) businessId: string,
    @Args('clientId', { type: () => String }) clientId: string,
    @Context() context,
  ) {
    return this.loyaltyService.getCustomerPoints(businessId, clientId, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => LoyaltyAnalyticsEntity, { name: 'loyaltyAnalytics', description: 'Retrieves loyalty program analytics.' })
  async getLoyaltyAnalytics(
    @Args('businessId', { type: () => String }) businessId: string,
    @Args('period', { type: () => String, defaultValue: 'month' }) period: string,
    @Context() context,
  ) {
    return this.loyaltyService.getLoyaltyAnalytics(businessId, period, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => PointsTransactionEntity, { description: 'Awards points to a customer.' })
  async earnPoints(
    @Args('input') input: EarnPointsInput,
    @Context() context,
  ) {
    const transaction = await this.loyaltyService.earnPoints(input, context.req.user);
    
    // Publish to subscribers
    this.pubSub.publish('pointsEarned', { 
      pointsEarned: transaction,
      businessId: transaction.loyaltyProgram.business.id 
    });
    
    return transaction;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => PointsTransactionEntity, { description: 'Redeems points for a customer.' })
  async redeemPoints(
    @Args('input') input: RedeemPointsInput,
    @Context() context,
  ) {
    const transaction = await this.loyaltyService.redeemPoints(input, context.req.user);
    
    // Publish to subscribers
    this.pubSub.publish('pointsRedeemed', { 
      pointsRedeemed: transaction,
      businessId: transaction.loyaltyProgram.business.id 
    });
    
    return transaction;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => Boolean, { description: 'Deletes a loyalty program.' })
  async deleteLoyaltyProgram(
    @Args('id', { type: () => String }) id: string,
    @Context() context,
  ) {
    const program = await this.loyaltyService.getLoyaltyProgramById(id, context.req.user);
    if (!program) {
      throw new Error('Loyalty program not found');
    }
    
    // Delete all associated transactions first
    await this.loyaltyService['prisma'].pointsTransaction.deleteMany({
      where: { loyaltyProgramId: id },
    });
    
    // Delete the program
    await this.loyaltyService['prisma'].loyaltyProgram.delete({
      where: { id },
    });
    
    return true;
  }

  // Subscriptions
  @Subscription(() => LoyaltyProgramEntity, {
    filter: (payload, variables) => {
      return payload.businessId === variables.businessId;
    },
  })
  loyaltyProgramCreated(@Args('businessId', { type: () => String }) businessId: string) {
    return this.pubSub.asyncIterableIterator('loyaltyProgramCreated');
  }

  @Subscription(() => LoyaltyProgramEntity, {
    filter: (payload, variables) => {
      return payload.businessId === variables.businessId;
    },
  })
  loyaltyProgramUpdated(@Args('businessId', { type: () => String }) businessId: string) {
    return this.pubSub.asyncIterableIterator('loyaltyProgramUpdated');
  }

  @Subscription(() => PointsTransactionEntity, {
    filter: (payload, variables) => {
      return payload.businessId === variables.businessId;
    },
  })
  pointsEarned(@Args('businessId', { type: () => String }) businessId: string) {
    return this.pubSub.asyncIterableIterator('pointsEarned');
  }

  @Subscription(() => PointsTransactionEntity, {
    filter: (payload, variables) => {
      return payload.businessId === variables.businessId;
    },
  })
  pointsRedeemed(@Args('businessId', { type: () => String }) businessId: string) {
    return this.pubSub.asyncIterableIterator('pointsRedeemed');
  }
}