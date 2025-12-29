import {
  ObjectType,
  Field,
  Int,
  Float,
} from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'
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
import { KycStatus } from '../dto/update-business.input'
import { PaymentConfigEntity } from '../../settings/entities/payment-config.entity'
import { HardwareConfigEntity } from '../../settings/entities/hardware-config.entity'
import { KycDocumentEntity } from '../../settings/entities/kyc-document.entity'
import { StoreEntity } from '../../store/entities/store.entity'
import { LoyaltyProgramEntity } from '../../loyalty-program/entities/loyalty-program.entity'
import { PromotionEntity } from '../../client/entities/promotion.entity'

@ObjectType()
export class BusinessEntity {
  @Field({nullable: true })
  id?: string

  @Field({nullable: true })
  name?: string

  @Field({ nullable: true })
  email?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  phone?: string

  @Field({ nullable: true })
  avatar?: string

  @Field({ nullable: true })
  coverImage?: string

  // New fields from Prisma schema
  @Field({ nullable: true })
  businessType?: string

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

  @Field()
  isVerified: boolean

  @Field(() => KycStatus, { nullable: true })
  kycStatus?: KycStatus

  @Field(() => Int)
  totalProductsSold: number

  @Field(() => Int)
  totalClients: number

  @Field(() => Int)
  totalWorkers: number

  @Field(() => Int)
  totalSales: number

  @Field(() => Float)
  totalRevenueGenerated: number

  @Field(() => Boolean)
  hasAgreedToTerms: boolean

  @Field(() => Boolean)
  isB2BEnabled: boolean

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

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

  @Field(() => PaymentConfigEntity, { nullable: true })
  paymentConfig?: PaymentConfigEntity

  @Field(() => HardwareConfigEntity, { nullable: true })
  hardwareConfig?: HardwareConfigEntity

  @Field(() => [KycDocumentEntity], { nullable: true })
  kyc?: KycDocumentEntity[]

  @Field(() => [StoreEntity], { nullable: true })
  stores?: StoreEntity[]

  @Field(() => LoyaltyProgramEntity, { nullable: true })
  loyaltyProgram?: LoyaltyProgramEntity

  @Field(() => [PromotionEntity], { nullable: true })
  promotions?: PromotionEntity[]

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
