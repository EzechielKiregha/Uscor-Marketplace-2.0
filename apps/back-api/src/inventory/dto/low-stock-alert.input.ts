import {
  Field,
  Int,
  InputType,
} from '@nestjs/graphql'
import {
  IsNumber,
  IsString,
  Min,
} from 'class-validator'

@InputType()
export class LowStockAlertInput {
  @Field()
  @IsString()
  storeId: string

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  threshold: number
}
