import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'
import { PaymentStatus } from './create-payment-transaction.input'
import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class UpdatePaymentTransactionInput {
  @Field({ nullable: true })
  @IsOptional()
  status?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  qrCode?: string
}
