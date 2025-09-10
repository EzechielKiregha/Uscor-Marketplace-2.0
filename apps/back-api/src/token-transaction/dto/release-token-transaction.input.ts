import {
  IsBoolean,
  IsString,
} from 'class-validator'
import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class ReleaseTokenTransactionInput {
  @Field()
  @IsString()
  tokenTransactionId: string

  @Field(() => Boolean)
  @IsBoolean()
  isReleased: boolean
}
