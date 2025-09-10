import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
  Float,
} from '@nestjs/graphql'
import { AccountRechargeService } from './account-recharge.service'
import { AccountRechargeEntity } from './entities/account-recharge.entity'
import { CreateAccountRechargeInput } from './dto/create-account-recharge.input'
import { UpdateAccountRechargeInput } from './dto/update-account-recharge.input'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { UseGuards } from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'

// Resolver
@Resolver(() => AccountRechargeEntity)
export class AccountRechargeResolver {
  constructor(
    private readonly accountRechargeService: AccountRechargeService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client')
  @Mutation(() => AccountRechargeEntity, {
    description: 'Creates an account recharge.',
  })
  async createAccountRecharge(
    @Args('createAccountRechargeInput')
    createAccountRechargeInput: CreateAccountRechargeInput,
    @Context() context,
  ) {
    const user = context.req.user
    return this.accountRechargeService.create(
      createAccountRechargeInput,
      user.id,
      user.role,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client')
  @Query(() => [AccountRechargeEntity], {
    name: 'accountRecharges',
    description:
      'Retrieves account recharges for a user.',
  })
  async getAccountRecharges(@Context() context) {
    const user = context.req.user
    return this.accountRechargeService.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client')
  @Query(() => AccountRechargeEntity, {
    name: 'accountRecharge',
    description:
      'Retrieves a single account recharge by ID.',
  })
  async getAccountRecharge(
    @Args('id', { type: () => String })
    id: string,
  ) {
    return this.accountRechargeService.findOne(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client')
  @Mutation(() => AccountRechargeEntity, {
    description: 'Updates an account recharge.',
  })
  async updateAccountRecharge(
    @Args('id', { type: () => String })
    id: string,
    @Args('updateAccountRechargeInput')
    updateAccountRechargeInput: UpdateAccountRechargeInput,
    @Context() context,
  ) {
    const user = context.req.user
    return this.accountRechargeService.update(
      id,
      updateAccountRechargeInput,
      user.id,
      user.role,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client')
  @Mutation(() => AccountRechargeEntity, {
    description: 'Deletes an account recharge.',
  })
  async deleteAccountRecharge(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.accountRechargeService.remove(
      id,
      user.id,
      user.role,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client')
  @Query(() => Float, {
    name: 'accountBalance',
    description:
      'Retrieves the account balance for a user.',
  })
  async getAccountBalance(@Context() context) {
    const user = context.req.user
    return this.accountRechargeService.getBalance(
      user.id,
      user.role,
    )
  }
}
