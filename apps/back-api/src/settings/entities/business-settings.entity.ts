import { ObjectType, Field, Int, Float } from '@nestjs/graphql'
import { PaymentConfigEntity } from './payment-config.entity'
import { HardwareConfigEntity } from './hardware-config.entity'
import { KycDocumentEntity } from './kyc-document.entity'
import { AccountRechargeEntity } from '../../account-recharge/entities/account-recharge.entity'
import { AdEntity } from '../../ad/entities/ad.entity'
import { ChatEntity } from '../../chat/entities/chat.entity'
import { FreelanceOrderEntity } from '../../freelance-order/entities/freelance-order.entity'
import { FreelanceServiceEntity } from '../../freelance-service/entities/freelance-service.entity'
import { PostOfSaleEntity } from '../../post-of-sale/entities/post-of-sale.entity'
import { ProductEntity } from '../../product/entities/product.entity'
import { ReOwnedProductEntity } from '../../re-owned-product/entities/re-owned-product.entity'
import { ReferralEntity } from '../../referral/entities/referral.entity'
import { RepostedProductEntity } from '../../reposted-product/entities/reposted-product.entity'
import { WorkerEntity } from '../../worker/entities/worker.entity'
import { StoreEntity } from '../../store/entities/store.entity'
import GraphQLJSON from 'graphql-type-json'

@ObjectType()
export class BusinessSettingsEntity {
  @Field()
  id: string

  @Field()
  name: string

  @Field()
  email: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  avatar?: string

  @Field({ nullable: true })
  coverImage?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  phone?: string

  @Field({ nullable: true })
  country?: string

  @Field({ nullable: true })
  businessType?: string

  @Field()
  kycStatus: string

  @Field()
  isB2BEnabled: boolean

  @Field()
  isVerified: boolean

  @Field()
  totalProductsSold: number

  @Field()
  hasAgreedToTerms: boolean

  @Field({ nullable: true })
  termsAgreedAt?: Date

  @Field(() => PaymentConfigEntity, { nullable: true })
  paymentConfig?: PaymentConfigEntity

  @Field(() => HardwareConfigEntity, { nullable: true })
  hardwareConfig?: HardwareConfigEntity

  @Field(() => [KycDocumentEntity], { nullable: true })
  kyc?: KycDocumentEntity[]

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field({ nullable: true })
  taxId?: string

  @Field({ nullable: true })
  registrationNumber?: string

  @Field({ nullable: true })
  website?: string

  @Field(() => GraphQLJSON, { nullable: true })
  socialLinks?: any

  @Field({ nullable: true })
  notes?: string

  @Field(() => GraphQLJSON, { nullable: true })
  preferences?: any

  @Field(() => Int)
  totalClients: number

  @Field(() => Int)
  totalWorkers: number

  @Field(() => Int)
  totalSales: number

  @Field(() => Float)
  totalRevenueGenerated: number

  // Relations
  @Field(() => [ProductEntity]) // Products associated with the business
  products: ProductEntity[]

  @Field(() => [WorkerEntity]) // Workers associated with the business
  workers: WorkerEntity[]

  @Field(() => [RepostedProductEntity]) // Reposted products
  repostedItems: RepostedProductEntity[]

  @Field(() => [ReOwnedProductEntity]) // Reowned products
  reownedItems: ReOwnedProductEntity[]

  @Field(() => [AccountRechargeEntity]) // Recharges made by the business
  recharges: AccountRechargeEntity[]

  @Field(() => [AdEntity]) // Ads created by the business
  ads: AdEntity[]

  @Field(() => [StoreEntity], { nullable: true })
  stores?: StoreEntity[]

  @Field(() => [FreelanceServiceEntity]) // Freelance services offered by the business
  freelanceServices: FreelanceServiceEntity[]

  @Field(() => [FreelanceOrderEntity]) // Freelance orders associated with the business
  freelanceOrders: FreelanceOrderEntity[]

  @Field(() => [ReferralEntity]) // Referrals made by the business
  referralsMade: ReferralEntity[]

  @Field(() => [ReferralEntity]) // Referrals received by the business
  referralsReceived: ReferralEntity[]

  @Field(() => [ChatEntity]) // Chats associated with the business
  chats: ChatEntity[]

  @Field(() => [PostOfSaleEntity], {
    nullable: true,
  })
  postOfSales?: PostOfSaleEntity[]
}
