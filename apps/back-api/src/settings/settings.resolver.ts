import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { BusinessSettingsEntity } from './entities/business-settings.entity'
import { KycDocumentEntity } from './entities/kyc-document.entity'
import { UpdateBusinessInput } from './dto/update-business.input'
import { UpdatePaymentConfigInput } from './dto/update-payment-config.input'
import { UpdateHardwareConfigInput } from './dto/update-hardware-config.input'
import { UploadKycDocumentInput } from './dto/upload-kyc-document.input'
import { AgreeToTermsInput } from './dto/agree-to-terms.input'

@Resolver(() => BusinessSettingsEntity)
export class SettingsResolver {
  constructor(
    private readonly settingsService: SettingsService,
    @Inject('PUB_SUB') private readonly pubSub: any,
  ) {}

  @Query(() => BusinessSettingsEntity, { name: 'business' })
  async getBusinessSettings(@Args('id') id: string) {
    return this.settingsService.getBusinessSettings(id)
  }

  @Mutation(() => BusinessSettingsEntity)
  async updateBusiness(
    @Args('id') id: string,
    @Args('input') input: UpdateBusinessInput,
  ) {
    return this.settingsService.updateBusinessProfile(id, input)
  }

  @Mutation(() => BusinessSettingsEntity)
  async updatePaymentConfig(@Args('businessId') businessId: string, @Args('input') input: UpdatePaymentConfigInput) {
    return this.settingsService.updatePaymentConfig(businessId, input as any)
  }

  @Mutation(() => BusinessSettingsEntity)
  async updateHardwareConfig(@Args('businessId') businessId: string, @Args('input') input: UpdateHardwareConfigInput) {
    return this.settingsService.updateHardwareConfig(businessId, input as any)
  }

  @Mutation(() => KycDocumentEntity)
  async uploadKycDocument(@Args('input') input: UploadKycDocumentInput) {
    return this.settingsService.uploadKycDocument(input)
  }

  @Mutation(() => BusinessSettingsEntity)
  async submitKyc(@Args('businessId') businessId: string) {
    return this.settingsService.submitKyc(businessId)
  }

  @Mutation(() => BusinessSettingsEntity)
  async agreeToTerms(@Args('businessId') businessId: string) {
    return this.settingsService.agreeToTerms(businessId)
  }

  @Subscription(() => BusinessSettingsEntity, {
    resolve: (payload) => payload.settingsUpdated,
  })
  settingsUpdated() {
    return this.pubSub.asyncIterator('SETTINGS_UPDATED')
  }

  @Subscription(() => BusinessSettingsEntity, {
    resolve: (payload) => payload.kycUpdated,
  })
  kycUpdated() {
    return this.pubSub.asyncIterator('KYC_UPDATED')
  }
}
