import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { LoyaltyService } from './loyalty-program.service';
import { LoyaltyProgramEntity } from './entities/loyalty-program.entity';
import { CreateLoyaltyProgramInput, CreatePointsTransactionInput } from './dto/loyalty-program.input';

import { PointsTransactionEntity } from './entities/points-transaction.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateLoyaltyProgramInput } from './dto/update-loyalty-program.input';
import { ClientPointsBalanceEntity } from './entities/client-points-balance.entity';
// Resolver
@Resolver(() => LoyaltyProgramEntity)
export class LoyaltyResolver {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => LoyaltyProgramEntity, { description: 'Creates a new loyalty program.' })
  async createLoyaltyProgram(
    @Args('createLoyaltyProgramInput') input: CreateLoyaltyProgramInput,
    @Context() context,
  ) {
    return this.loyaltyService.createLoyaltyProgram(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => LoyaltyProgramEntity, { description: 'Updates a loyalty program.' })
  async updateLoyaltyProgram(
    @Args('id', { type: () => String }) id: string,
    @Args('updateLoyaltyProgramInput') input: UpdateLoyaltyProgramInput,
    @Context() context,
  ) {
    return this.loyaltyService.updateLoyaltyProgram(id, input, context.req.user);
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
}