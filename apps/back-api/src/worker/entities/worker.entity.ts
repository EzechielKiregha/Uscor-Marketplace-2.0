import { ObjectType, Field } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { FreelanceServiceEntity } from '../../freelance-service/entities/freelance-service.entity';
import { KnowYourCustomerEntity } from '../../know-your-customer/entities/know-your-customer.entity';

@ObjectType()
export class WorkerEntity {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  isVerified?: boolean;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity;

  @Field(() => KnowYourCustomerEntity, { nullable: true })
  kyc?: KnowYourCustomerEntity;

  @Field(() => [FreelanceServiceEntity], { nullable: true })
  freelanceServices?: FreelanceServiceEntity[];

  @Field(() => [ChatEntity], { nullable: true }) // Chats associated with the worker
  chats?: ChatEntity[];
}
