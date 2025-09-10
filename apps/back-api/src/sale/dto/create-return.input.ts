import {
  InputType,
  Int,
  Field,
} from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class CreateReturnInput {
  @Field()
  @IsString()
  saleId: string

  @Field()
  @IsString()
  reason: string
}
