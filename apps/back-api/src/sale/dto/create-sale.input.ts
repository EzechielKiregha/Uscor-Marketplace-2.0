import { InputType, Field, Float } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SaleProductInput } from './sale-product.input';
import { PaymentMethod } from 'src/payment-transaction/dto/create-payment-transaction.input';

@InputType()
export class CreateSaleInput {
  @Field()
  @IsString()
  storeId: string;

  @Field()
  @IsString()
  workerId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  clientId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => [SaleProductInput])
  @IsArray()
  saleProducts: SaleProductInput[];
}