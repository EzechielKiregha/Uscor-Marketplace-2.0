import {
  InputType,
  Field,
  Float,
} from '@nestjs/graphql'
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { SaleProductInput } from './sale-product.input'
import { PaymentMethod } from '../../payment-transaction/dto/create-payment-transaction.input'

@InputType()
export class CreateSaleInput {
  @Field()
  @IsString()
  storeId: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workerId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  clientId?: string

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number

  @Field(() => PaymentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod

  @Field(() => [SaleProductInput], {
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  saleProducts?: SaleProductInput[]
}
