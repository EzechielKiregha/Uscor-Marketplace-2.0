import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsObject,
  IsNumber,
  IsEmail,
} from 'class-validator'
import {
  InputType,
  Field,
  Int,
  PartialType,
  registerEnumType,
  Float,
} from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'
import { KycStatus } from '../../business/dto/update-business.input'

@InputType()
export class UpdateBusinessInput {
  
    @Field({nullable: true})
    @IsString()
    name?: string
  
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    email?: string
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    avatar?: string
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    coverImage?: string
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    address?: string
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    phone?: string
  
    @Field({ defaultValue: false })
    @IsBoolean()
    isVerified: boolean
  
    @Field({ nullable: true, defaultValue: 'NA' })
    @IsOptional()
    @IsString()
    businessType?: string
  
    @Field({ nullable: true, defaultValue: 'NA' })
    @IsOptional()
    @IsString()
    taxId?: string
  
    @Field({ nullable: true, defaultValue: 'NA' })
    @IsOptional()
    @IsString()
    registrationNumber?: string
  
    @Field({ nullable: true, defaultValue: 'NA' })
    @IsOptional()
    @IsString()
    website?: string
    
    @Field({ nullable: true, defaultValue: 'NA' })
    @IsOptional()
    @IsString()
    country?: string
  
    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    @IsObject()
    socialLinks?: any
  
    @Field({ nullable: true, defaultValue: 'NA' })
    @IsOptional()
    @IsString()
    notes?: string
  
    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    @IsObject()
    preferences?: any
  
    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsInt()
    totalClients?: number
  
    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsInt()
    totalWorkers?: number
  
    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsInt()
    totalSales?: number
  
    @Field(() => Float, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsNumber()
    totalRevenueGenerated?: number
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    kycId?: string
  
    @Field(() => KycStatus, { defaultValue: 'PENDING', nullable: true })
    @IsOptional()
    kycStatus?: KycStatus
  
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
