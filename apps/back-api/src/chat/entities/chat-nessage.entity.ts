import { ObjectType, Field } from '@nestjs/graphql';

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
