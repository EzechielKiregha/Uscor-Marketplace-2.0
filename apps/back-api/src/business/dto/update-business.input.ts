import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsObject,
  IsNumber,
} from 'class-validator'
import { CreateBusinessInput } from './create-business.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
  registerEnumType,
  Float,
} from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

registerEnumType(KycStatus, { name: 'KycStatus' })

@InputType()
export class UpdateBusinessInput extends PartialType(
  CreateBusinessInput,
) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  kycId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string

  @Field(() => KycStatus)
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean | undefined

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  totalProductsSold?: number

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasAgreedToTerms?: boolean | undefined

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isB2BEnabled?: boolean | undefined

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessType?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  registrationNumber?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  socialLinks?: any

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  preferences?: any

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  totalClients?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  totalWorkers?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  totalSales?: number

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalRevenueGenerated?: number
}
