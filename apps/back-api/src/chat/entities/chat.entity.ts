import { ObjectType, Field } from '@nestjs/graphql';
import { ChatMessageEntity } from 'src/chat/entities/chat-nessage.entity';
import { ProductEntity } from 'src/product/entities/product.entity';
import { ChatStatus, NegotiationType } from '../dto/create-chat.input';
import { FreelanceServiceEntity } from 'src/freelance-service/entities/freelance-service.entity';
import { ChatParticipantEntity } from './chat-participants.entity';

@ObjectType()
export class ChatEntity {
  @Field()
  id: string;

  @Field(() => ChatStatus)
  status: ChatStatus;

  @Field(() => Boolean)
  isSecure: boolean;

  @Field(() => NegotiationType, { nullable: true })
  negotiationType?: NegotiationType;

  @Field({ nullable: true })
  productId?: string;

  @Field(() => ProductEntity, { nullable: true })
  product?: ProductEntity;

  @Field({ nullable: true })
  serviceId?: string;

  @Field(() => FreelanceServiceEntity, { nullable: true })
  service?: FreelanceServiceEntity;

  @Field(() => [ChatParticipantEntity])
  participants: ChatParticipantEntity[];

  @Field(() => [ChatMessageEntity])
  messages: ChatMessageEntity[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}




