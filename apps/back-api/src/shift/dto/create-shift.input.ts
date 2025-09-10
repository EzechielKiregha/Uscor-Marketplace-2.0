import {
  InputType,
  Int,
  Field,
} from '@nestjs/graphql'
import { IsDate, IsString } from 'class-validator'

// DTOs
@InputType()
export class CreateShiftInput {
  @Field()
  @IsString()
  storeId: string

  @Field()
  @IsDate()
  startTime: Date
}

@InputType()
export class EndShiftInput {
  @Field()
  @IsString()
  shiftId: string

  @Field()
  @IsDate()
  endTime: Date
}
