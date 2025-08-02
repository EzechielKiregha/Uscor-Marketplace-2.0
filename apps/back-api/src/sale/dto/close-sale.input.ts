import { InputType, Int, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SaleStatus } from 'src/generated/prisma/enums';
import { PaymentMethod } from 'src/payment-transaction/dto/create-payment-transaction.input';

// Enums
registerEnumType(SaleStatus, { name: 'SaleStatus' });


@InputType()
export class CloseSaleInput {
  @Field()
  @IsString()
  saleId: string;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => SaleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
