import {
  InputType,
  Int,
  Field,
  Float,
  registerEnumType,
} from '@nestjs/graphql'
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'

// Enums
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  TOKEN = 'TOKEN',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CASH = 'CASH',
  CARD = 'CARD',
}

// Register enums with GraphQL
registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
})
registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
})

@InputType()
export class CreatePaymentTransactionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method: PaymentMethod

  @Field(() => PaymentStatus)
  @IsEnum(PaymentStatus)
  status: PaymentStatus

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  qrCode?: string
}
