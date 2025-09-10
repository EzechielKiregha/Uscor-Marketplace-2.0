import {
  ObjectType,
  Field,
} from '@nestjs/graphql'
import { BusinessEntity } from '../../business/entities/business.entity'
import { ClientEntity } from '../../client/entities/client.entity'

@ObjectType()
export class ReferralEntity {
  @Field()
  id: string

  @Field({ nullable: true })
  affiliateBusinessId?: string

  @Field({ nullable: true })
  affiliateClientId?: string

  @Field({ nullable: true })
  referredBusinessId?: string

  @Field({ nullable: true })
  referredClientId?: string

  @Field()
  verifiedPurchase: boolean

  @Field()
  createdAt: Date

  // Relations
  @Field(() => BusinessEntity, { nullable: true }) // Business that made the referral
  affiliateBusiness: BusinessEntity

  @Field(() => ClientEntity, { nullable: true }) // Client that made the referral
  affiliateClient: ClientEntity

  @Field(() => BusinessEntity, { nullable: true }) // Business that was referred
  referredBusiness: BusinessEntity

  @Field(() => ClientEntity, { nullable: true }) // Client that was referred
  referredClient: ClientEntity
}
