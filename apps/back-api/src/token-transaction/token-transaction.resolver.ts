import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { TokenTransactionService } from './token-transaction.service';
import { TokenTransactionEntity } from './entities/token-transaction.entity';
import { CreateTokenTransactionInput } from './dto/create-token-transaction.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RedeemTokenTransactionInput } from './dto/redeem-token-transaction.input';
import { ReleaseTokenTransactionInput } from './dto/release-token-transaction.input';
// Resolver
@Resolver(() => TokenTransactionEntity)
export class TokenTransactionResolver {
  constructor(private readonly tokenTransactionService: TokenTransactionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => TokenTransactionEntity, { description: 'Creates a token transaction.' })
  async createTokenTransaction(
    @Args('createTokenTransactionInput') createTokenTransactionInput: CreateTokenTransactionInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (user.id !== createTokenTransactionInput.businessId) {
      throw new Error('Businesses can only create token transactions for themselves');
    }
    return this.tokenTransactionService.create(createTokenTransactionInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => TokenTransactionEntity, { description: 'Redeems a token transaction.' })
  async redeemTokenTransaction(
    @Args('redeemTokenTransactionInput') redeemTokenTransactionInput: RedeemTokenTransactionInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.tokenTransactionService.redeem(redeemTokenTransactionInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => TokenTransactionEntity, { description: 'Releases a token transaction.' })
  async releaseTokenTransaction(
    @Args('releaseTokenTransactionInput') releaseTokenTransactionInput: ReleaseTokenTransactionInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.tokenTransactionService.release(releaseTokenTransactionInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [TokenTransactionEntity], { name: 'tokenTransactions', description: 'Retrieves token transactions for a business.' })
  async getTokenTransactions(@Context() context) {
    const user = context.req.user;
    return this.tokenTransactionService.findAll(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => TokenTransactionEntity, { name: 'tokenTransaction', description: 'Retrieves a single token transaction by ID.' })
  async getTokenTransaction(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.tokenTransactionService.findOne(id, user.id);
  }
}