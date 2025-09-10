import { InputType, Field } from '@nestjs/graphql'
import {
  IsOptional,
  IsString,
} from 'class-validator'

@InputType()
export class ProcessPaymentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  transactionId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  method?: string
}
