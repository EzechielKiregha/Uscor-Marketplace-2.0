import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator'
import { CreateBusinessInput } from './create-business.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
  registerEnumType,
} from '@nestjs/graphql'

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
}
