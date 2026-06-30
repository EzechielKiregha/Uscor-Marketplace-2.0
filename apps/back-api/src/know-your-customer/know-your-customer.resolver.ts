import { Inject } from '@nestjs/common'
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql'
import { BusinessEntity } from '../business/entities/business.entity'
import { RejectKycInput } from './dto/reject-kyc.input'
import { VerifyKycInput } from './dto/verify-kyc.input'
import { KnowYourCustomerEntity } from './entities/know-your-customer.entity'
import { KycDocumentEntity } from './entities/kyc-document.entity'
import { KnowYourCustomerService } from './know-your-customer.service'
import { UpdateKycInput } from './dto/update-kyc.input'

@Resolver(() => KnowYourCustomerEntity)
export class KnowYourCustomerResolver {
  constructor(
    readonly knowYourCustomerService: KnowYourCustomerService,
    @Inject('PUB_SUB')
    private readonly pubSub: any,
  ) {}

  @Query(() => [KycDocumentEntity], {
    name: 'kycDocuments',
  })
  async getKycDocuments(
    @Args('businessId') businessId: string,
  ) {
    return this.knowYourCustomerService.getBusinessGetKycDocuments(
      businessId,
    )
  }

  @Mutation(() => KnowYourCustomerEntity, {
    name: 'verifyKyc',
  })
  async verifyKyc(
    @Args('input') input: VerifyKycInput,
  ) {
    return this.knowYourCustomerService.verifyKyc(
      input.businessId,
      input.notes,
      input.documentUrl,
    )
  }
  @Mutation(() => KnowYourCustomerEntity, {
    name: 'updateKyc',
  })
  async updateKyc(
    @Args('input') input: UpdateKycInput,
  ) {
    return this.knowYourCustomerService.updateKyc(
      input.businessId,
      input.documentUrl,
    )
  }
  @Mutation(() => BusinessEntity, {
    name: 'submitKyc',
  })
  async submitKyc(
    @Args('businessId') businessId: string,
  ) {
    return this.knowYourCustomerService.submitKyc(
      businessId,
    )
  }

  @Mutation(() => KnowYourCustomerEntity, {
    name: 'rejectKyc',
  })
  async rejectKyc(
    @Args('input') input: RejectKycInput,
  ) {
    return this.knowYourCustomerService.rejectKyc(
      input.businessId,
      input.rejectionReason,
      input.documentUrl,
    )
  }

  @Subscription(() => KnowYourCustomerEntity, {
    resolve: (payload) => payload.kycUpdated,
  })
  kycUpdated() {
    return this.pubSub.asyncIterator(
      'KYC_UPDATED',
    )
  }

  @Subscription(() => KnowYourCustomerEntity, {
    resolve: (payload) => payload.kycSubmitted,
  })
  kycSubmitted() {
    return this.pubSub.asyncIterableIterator(
      'KYC_SUBMITTED',
    )
  }
}
