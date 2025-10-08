import {
  ObjectType,
  Field,
  Int,
} from '@nestjs/graphql'
import { ChatMessageEntity } from '../../chat/entities/chat-nessage.entity'
import {
  ChatStatus,
  NegotiationType,
} from '../dto/create-chat.input'
import { FreelanceServiceEntity } from '../../freelance-service/entities/freelance-service.entity'
import { ChatParticipantEntity } from './chat-participants.entity'
import { BusinessEntity } from '../../business/entities/business.entity'

@ObjectType()
export class ChatProductInfo {
  @Field()
  id: string

  @Field()
  title: string

  @Field()
  description: string

  @Field()
  price: number

  @Field({ nullable: true })
  businessId?: string

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity

  @Field({ nullable: true })
  isPhysical?: boolean
}

@ObjectType()
export class ChatUserInfo {
  @Field()
  id: string

  @Field({ nullable: true })
  fullName?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  avatar?: string
}
@ObjectType()
export class chatNotification {
  @Field()
  id: string
  @Field()
  chatId: string
  @Field()
  userId: string
  @Field(() => Date)
  lastReadAt: Date
  @Field(() => Int)
  unreadCount: number
  @Field(() => Date)
  createdAt: Date
  @Field(() => Date)
  updatedAt: Date
}

@ObjectType()
export class ChatEntity {
  @Field()
  id: string

  @Field(() => ChatStatus)
  status: ChatStatus

  @Field(() => Boolean)
  isSecure: boolean

  @Field(() => NegotiationType, {
    nullable: true,
  })
  negotiationType?: NegotiationType

  @Field(() => String, { nullable: true })
  productId?: string | null

  @Field(() => ChatProductInfo, {
    nullable: true,
  })
  product?: ChatProductInfo

  @Field({ nullable: true })
  serviceId?: string

  @Field(() => FreelanceServiceEntity, {
    nullable: true,
  })
  service?: FreelanceServiceEntity

  @Field({ nullable: true })
  clientId?: string

  @Field(() => ChatUserInfo, { nullable: true })
  client?: ChatUserInfo

  @Field({ nullable: true })
  businessId?: string

  @Field(() => ChatUserInfo, { nullable: true })
  business?: ChatUserInfo

  @Field({ nullable: true })
  workerId?: string

  @Field(() => ChatUserInfo, { nullable: true })
  worker?: ChatUserInfo

  @Field(() => [ChatParticipantEntity])
  participants: ChatParticipantEntity[]

  @Field(() => [ChatMessageEntity])
  messages: ChatMessageEntity[]

  @Field(() => Number, { defaultValue: 0 })
  unreadCount: number

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date
}
