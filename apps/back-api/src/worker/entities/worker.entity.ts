import { ObjectType, Field } from '@nestjs/graphql';
import { BusinessEntity } from 'src/business/entities/business.entity';
import { ChatEntity } from 'src/chat/entities/chat.entity';
import { FreelanceServiceEntity } from 'src/freelance-service/entities/freelance-service.entity';
import { KnowYourCustomerEntity } from 'src/know-your-customer/entities/know-your-customer.entity';

@ObjectType()
export class WorkerEntity {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  role?: string;

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity;

  @Field(() => KnowYourCustomerEntity, { nullable: true })
  kyc?: KnowYourCustomerEntity;

  @Field(() => [FreelanceServiceEntity], { nullable: true })
  freelanceServices?: FreelanceServiceEntity[];

  @Field(() => [ChatEntity]) // Chats associated with the worker
  chats: ChatEntity[];
}
