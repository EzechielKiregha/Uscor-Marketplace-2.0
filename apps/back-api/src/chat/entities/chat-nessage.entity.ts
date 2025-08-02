import { ObjectType, Field } from '@nestjs/graphql';
import { ChatEntity } from 'src/chat/entities/chat.entity';

@ObjectType()
export class ChatMessageEntity {
  @Field()
  id: string;

  @Field()
  chatId: string;

  @Field()
  message: string;

  @Field()
  senderId: string;

  @Field()
  createdAt: Date;
}
