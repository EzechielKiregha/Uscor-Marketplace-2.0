import { InputType, Field, Float } from '@nestjs/graphql'
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'

@InputType()
export class UpdatePlatformSettingsInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  platformFeePercentage?: number

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTransactionAmount?: number

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTransactionAmount?: number

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tokenValue?: number

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tokenSymbol?: string

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  kycRequired?: boolean

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  b2bEnabled?: boolean

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  marketplaceEnabled?: boolean
}