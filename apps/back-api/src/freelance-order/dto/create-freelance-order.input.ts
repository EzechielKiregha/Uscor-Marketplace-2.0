import { InputType, Int, Field, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RechargeMethod } from 'src/account-recharge/dto/create-account-recharge.input';
import { PaymentMethod } from 'src/payment-transaction/dto/create-payment-transaction.input';


// Enums
export enum FreelanceStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EscrowStatus {
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
}


registerEnumType(FreelanceStatus, { name: 'FreelanceStatus' });
registerEnumType(EscrowStatus, { name: 'EscrowStatus' });

// DTOs
@InputType()
export class CreateFreelanceOrderInput {
  @Field()
  @IsString()
  serviceId: string;

  @Field()
  @IsString()
  clientId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  businessIds?: string[];

  @Field(() => PaymentMethod, { defaultValue: PaymentMethod.TOKEN })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

