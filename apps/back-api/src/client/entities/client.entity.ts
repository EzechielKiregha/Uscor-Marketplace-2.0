import {
  ObjectType,
  Field,
} from '@nestjs/graphql'
import { AccountRechargeEntity } from '../../account-recharge/entities/account-recharge.entity'
import { ChatEntity } from '../../chat/entities/chat.entity'
import { FreelanceOrderEntity } from '../../freelance-order/entities/freelance-order.entity'
import { OrderEntity } from '../../order/entities/order.entity'
import { ReferralEntity } from '../../referral/entities/referral.entity'
import { ReviewEntity } from '../../review/entities/review.entity'

@ObjectType()
export class ClientEntity {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: true })
  username?: string

  @Field({ nullable: true })
  email?: string

  @Field({ nullable: true })
  fullName?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  phone?: string
  
  @Field({ nullable: true })
  avatar?: string

  @Field({ nullable: true })
  password?: string // This should be hashed and not exposed in the GraphQL schema

  @Field({ nullable: true })
  isVerified?: boolean

  @Field({ nullable: true })
  createdAt?: Date

  @Field({ nullable: true })
  updatedAt?: Date

  // Relations
  @Field(() => [OrderEntity], { nullable: true }) // Orders made by the client
  orders?: OrderEntity[]

  @Field(() => [ReviewEntity], { nullable: true }) // Reviews written by the client
  reviews?: ReviewEntity[]

  // @Field(() => [ChatEntity]) // Chats associated with the client
  // chats: ChatEntity[];

  @Field(() => [AccountRechargeEntity], {
    nullable: true,
  }) // Recharges made by the client
  recharges?: AccountRechargeEntity[]

  @Field(() => [FreelanceOrderEntity], {
    nullable: true,
  }) // Freelance orders made by the client
  freelanceOrders?: FreelanceOrderEntity[]

  @Field(() => [ReferralEntity], {
    nullable: true,
  }) // Referrals made by the client
  referralsMade?: ReferralEntity[]

  @Field(() => [ReferralEntity], {
    nullable: true,
  }) // Referrals received by the client
  referralsReceived?: ReferralEntity[]
}
