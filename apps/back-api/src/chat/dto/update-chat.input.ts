import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'
import {
  ChatStatus,
  NegotiationType,
} from './create-chat.input'
import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class UpdateChatInput {
  @Field()
  @IsString()
  id: string

  @Field(() => ChatStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ChatStatus)
  status?: ChatStatus

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isSecure?: boolean

  @Field(() => NegotiationType, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(NegotiationType)
  negotiationType?: NegotiationType
}
