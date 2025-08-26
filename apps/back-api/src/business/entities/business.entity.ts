import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AccountRechargeEntity } from '../../account-recharge/entities/account-recharge.entity';
import { AdEntity } from '../../ad/entities/ad.entity';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { FreelanceOrderEntity } from '../../freelance-order/entities/freelance-order.entity';
import { FreelanceServiceEntity } from '../../freelance-service/entities/freelance-service.entity';
import { PostOfSaleEntity } from '../../post-of-sale/entities/post-of-sale.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { ReOwnedProductEntity } from '../../re-owned-product/entities/re-owned-product.entity';
import { ReferralEntity } from '../../referral/entities/referral.entity';
import { RepostedProductEntity } from '../../reposted-product/entities/reposted-product.entity';
import { WorkerEntity } from '../../worker/entities/worker.entity';
import { KycStatus } from '../dto/update-business.input';

@ObjectType()
export class BusinessEntity {
  @Field()
  id: string;
  
  @Field()
  name: string;
  
  @Field()
  email: string;
  
  @Field({ nullable: true })
  description?: string;
  
  @Field({ nullable: true })
  address?: string;
  
  @Field({ nullable: true })
  phone?: string;
  
  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field()
  isVerified: boolean;

  @Field(() => KycStatus)
  kycStatus : KycStatus

  @Field(() => Int)
  totalProductsSold : number

  @Field(() => Boolean)
  hasAgreedToTerms: boolean;
  
  @Field(() => Boolean)
  isB2BEnabled: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
  
  // Relations
  @Field(() => [ProductEntity]) // Products associated with the business
  products: ProductEntity[];

  @Field(() => [WorkerEntity]) // Workers associated with the business
  workers: WorkerEntity[];

  @Field(() => [RepostedProductEntity]) // Reposted products
  repostedItems: RepostedProductEntity[];

  @Field(() => [ReOwnedProductEntity]) // Reowned products
  reownedItems: ReOwnedProductEntity[];

  @Field(() => [AccountRechargeEntity]) // Recharges made by the business
  recharges: AccountRechargeEntity[];

  @Field(() => [AdEntity]) // Ads created by the business
  ads: AdEntity[];

  @Field(() => [FreelanceServiceEntity]) // Freelance services offered by the business
  freelanceServices: FreelanceServiceEntity[];

  @Field(() => [FreelanceOrderEntity]) // Freelance orders associated with the business
  freelanceOrders: FreelanceOrderEntity[];

  @Field(() => [ReferralEntity]) // Referrals made by the business
  referralsMade: ReferralEntity[];

  @Field(() => [ReferralEntity]) // Referrals received by the business
  referralsReceived: ReferralEntity[];

  @Field(() => [ChatEntity]) // Chats associated with the business
  chats: ChatEntity[];
  
  @Field(() => [PostOfSaleEntity], { nullable: true })
  postOfSales?: PostOfSaleEntity[];
}
