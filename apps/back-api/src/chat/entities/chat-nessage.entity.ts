import {
  ObjectType,
  Field,
} from '@nestjs/graphql'
import { ChatUserInfo } from './chat.entity'

@ObjectType()
export class ChatMessageEntity {
  @Field()
  id: string

  @Field()
  chatId: string

  @Field()
  content: string

  @Field({nullable: true })
  senderType?: string

  @Field(() => String, { nullable: true })
  senderId?: string | null

  @Field(() => ChatUserInfo, { nullable: true })
  sender?: ChatUserInfo

  @Field()
  createdAt: Date
}
