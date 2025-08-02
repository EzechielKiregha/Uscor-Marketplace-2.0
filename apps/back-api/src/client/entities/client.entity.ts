import { ObjectType, Field } from '@nestjs/graphql';
import { AccountRechargeEntity } from 'src/account-recharge/entities/account-recharge.entity';
import { ChatEntity } from 'src/chat/entities/chat.entity';
import { FreelanceOrderEntity } from 'src/freelance-order/entities/freelance-order.entity';
import { OrderEntity } from 'src/order/entities/order.entity';
import { ReferralEntity } from 'src/referral/entities/referral.entity';
import { ReviewEntity } from 'src/review/entities/review.entity';

@ObjectType()
export class ClientEntity {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  password: string; // This should be hashed and not exposed in the GraphQL schema

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => [OrderEntity]) // Orders made by the client
  orders: OrderEntity[];

  @Field(() => [ReviewEntity]) // Reviews written by the client
  reviews: ReviewEntity[];

  @Field(() => [ChatEntity]) // Chats associated with the client
  chats: ChatEntity[];

  @Field(() => [AccountRechargeEntity]) // Recharges made by the client
  recharges: AccountRechargeEntity[];

  @Field(() => [FreelanceOrderEntity]) // Freelance orders made by the client
  freelanceOrders: FreelanceOrderEntity[];

  @Field(() => [ReferralEntity]) // Referrals made by the client
  referralsMade: ReferralEntity[];

  @Field(() => [ReferralEntity]) // Referrals received by the client
  referralsReceived: ReferralEntity[];
}
