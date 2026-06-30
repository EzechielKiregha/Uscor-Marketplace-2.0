import { Inject } from '@nestjs/common'
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql'
import { UpdateBusinessInput } from './dto/update-business.input'
import { UpdateHardwareConfigInput } from './dto/update-hardware-config.input'
import { UpdatePaymentConfigInput } from './dto/update-payment-config.input'
import { BusinessSettingsEntity } from './entities/business-settings.entity'
import { SettingsService } from './settings.service'
import { KycDocumentEntity } from '../know-your-customer/entities/kyc-document.entity'

@Resolver(() => BusinessSettingsEntity)
export class SettingsResolver {
  constructor(
    private readonly settingsService: SettingsService,
    @Inject('PUB_SUB')
    private readonly pubSub: any,
  ) {}

  @Query(() => BusinessSettingsEntity, {
    name: 'business',
  })
  async getBusinessSettings(
    @Args('id') id: string,
  ) {
    return this.settingsService.getBusinessSettings(
      id,
    )
  }

  @Mutation(() => BusinessSettingsEntity)
  async updateBusiness(
    @Args('id') id: string,
    @Args('input') input: UpdateBusinessInput,
  ) {
    return this.settingsService.updateBusinessProfile(
      id,
      input,
    )
  }

  @Mutation(() => BusinessSettingsEntity)
  async updatePaymentConfig(
    @Args('businessId') businessId: string,
    @Args('input')
    input: UpdatePaymentConfigInput,
  ) {
    return this.settingsService.updatePaymentConfig(
      businessId,
      input as any,
    )
  }

  @Mutation(() => BusinessSettingsEntity)
  async updateHardwareConfig(
    @Args('businessId') businessId: string,
    @Args('input')
    input: UpdateHardwareConfigInput,
  ) {
    return this.settingsService.updateHardwareConfig(
      businessId,
      input as any,
    )
  }

  @Mutation(() => BusinessSettingsEntity)
  async agreeToTerms(
    @Args('businessId') businessId: string,
  ) {
    return this.settingsService.agreeToTerms(
      businessId,
    )
  }

  @Subscription(() => BusinessSettingsEntity, {
    resolve: (payload) => payload.settingsUpdated,
  })
  settingsUpdated() {
    return this.pubSub.asyncIterator(
      'SETTINGS_UPDATED',
    )
  }
}
