import { InputType, Field, Int } from '@nestjs/graphql'
import { PaymentMethod } from '../../payment-transaction/dto/create-payment-transaction.input'
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { RechargeMethod } from '../../account-recharge/dto/create-account-recharge.input'

@InputType()
export class PaymentMethodInput {
  @Field()
  @IsString()
  type: string

  @Field({nullable: true})
  @IsString()
  @IsOptional()
  provider?: string

  @Field({nullable: true})
  @IsString()
  @IsOptional()
  accountNumber?: string

  @Field(() => Int, {nullable: true})
  @IsInt()
  @IsOptional()
  expiryMonth?: number

  @Field(() => Int, {nullable: true})
  @IsInt()
  @IsOptional()
  expiryYear?: number

  @Field({nullable: true})
  @IsString()
  @IsOptional()
  cardToken?: string 

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  last4?: string

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
