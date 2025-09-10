import {
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'

// Enums
export enum ChatStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum NegotiationType {
  REOWNERSHIP = 'REOWNERSHIP',
  FREELANCEORDER = 'FREELANCEORDER',
  PURCHASE = 'PURCHASE',
  GENERAL = 'GENERAL',
}

registerEnumType(ChatStatus, {
  name: 'ChatStatus',
})
registerEnumType(NegotiationType, {
  name: 'NegotiationType',
})

// DTOs
@InputType()
export class CreateChatInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  serviceId?: string

  @Field(() => [String])
  @IsArray()
  participantIds: string[]

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isSecure: boolean

  @Field(() => NegotiationType, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(NegotiationType)
  negotiationType?: NegotiationType
}

@InputType()
export class CreateChatMessageInput {
  @Field()
  @IsString()
  chatId: string

  @Field()
  @IsString()
  message: string
}

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  chatId: string

  @Field()
  @IsString()
  content: string

  @Field()
  @IsString()
  senderType: string

  @Field()
  @IsString()
  senderId: string
}

@InputType()
export class StartNegotiationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  serviceId?: string

  @Field(() => [String])
  @IsArray()
  participantIds: string[]

  @Field(() => NegotiationType, {
    defaultValue: NegotiationType.GENERAL,
  })
  @IsEnum(NegotiationType)
  negotiationType: NegotiationType
}
