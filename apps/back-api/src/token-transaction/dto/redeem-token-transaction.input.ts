import {
  IsBoolean,
  IsString,
} from 'class-validator'
import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class RedeemTokenTransactionInput {
  @Field()
  @IsString()
  tokenTransactionId: string

  @Field(() => Boolean)
  @IsBoolean()
  isRedeemed: boolean
}
