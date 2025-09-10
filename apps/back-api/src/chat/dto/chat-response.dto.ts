import {
  ObjectType,
  Field,
} from '@nestjs/graphql'
import { ChatEntity } from '../entities/chat.entity'
import { ChatMessageEntity } from '../entities/chat-nessage.entity'

@ObjectType()
export class PaginatedChatsResponse {
  @Field(() => [ChatEntity])
  items: ChatEntity[]

  @Field()
  total: number

  @Field()
  page: number

  @Field()
  limit: number
}

@ObjectType()
export class PaginatedMessagesResponse {
  @Field(() => [ChatMessageEntity])
  items: ChatMessageEntity[]

  @Field()
  hasMore: boolean

  @Field({ nullable: true })
  cursor?: string
}

@ObjectType()
export class UnreadCountResponse {
  @Field()
  totalUnread: number

  @Field(() => [ChatUnreadInfo])
  chatsWithUnread: ChatUnreadInfo[]
}

@ObjectType()
export class ChatUnreadInfo {
  @Field()
  chatId: string

  @Field()
  unreadCount: number
}

@ObjectType()
export class MarkAsReadResponse {
  @Field()
  success: boolean

  @Field()
  unreadCount: number
}

@ObjectType()
export class UnreadCountUpdate {
  @Field()
  totalUnread: number

  @Field()
  chatId: string

  @Field()
  unreadCount: number
}
