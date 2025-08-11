import { PaymentMethod } from '../../payment-transaction/dto/create-payment-transaction.input';
import { InputType, Field } from '@nestjs/graphql';
import { SaleProductInput } from './sale-product.input';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class UpdateSaleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  clientId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @Field(() => PaymentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @Field(() => [SaleProductInput], { nullable: true })
  @IsOptional()
  @IsArray()
  saleProducts?: SaleProductInput[];
}