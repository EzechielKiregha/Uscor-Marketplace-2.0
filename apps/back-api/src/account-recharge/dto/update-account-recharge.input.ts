import {
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator'
import {
  Country,
  RechargeMethod,
} from './create-account-recharge.input'
import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class UpdateAccountRechargeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number

  @Field(() => RechargeMethod, { nullable: true })
  @IsOptional()
  @IsEnum(RechargeMethod)
  method?: RechargeMethod

  @Field(() => Country, { nullable: true })
  @IsOptional()
  @IsEnum(Country)
  origin?: Country
}
