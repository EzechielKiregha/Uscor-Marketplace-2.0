import { InputType, Field, registerEnumType, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// Enums
export enum RechargeMethod {
  MTN_MONEY = 'MTN_MONEY',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MPESA = 'MPESA',
  TOKEN = 'TOKEN'
}

export enum Country {
  DRC = 'DRC',
  KENYA = 'KENYA',
  UGANDA = 'UGANDA',
  RWANDA = 'RWANDA',
  BURUNDI = 'BURUNDI',
  TANZANIA = 'TANZANIA',
}

// Register enums with GraphQL
registerEnumType(RechargeMethod, { name: 'RechargeMethod' });
registerEnumType(Country, { name: 'Country' });

// DTOs
@InputType()
export class CreateAccountRechargeInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => RechargeMethod)
  @IsEnum(RechargeMethod)
  method: RechargeMethod;

  @Field(() => Country)
  @IsEnum(Country)
  origin: Country;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  clientId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tokenTransactionId?: string;
}

