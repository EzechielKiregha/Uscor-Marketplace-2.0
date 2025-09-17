import { InputType, Field, Float, Int } from '@nestjs/graphql'
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsObject,
  IsInt,
  IsNumber,
} from 'class-validator'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class CreateBusinessInput {
  @Field()
  @IsString()
  name: string

  @Field()
  @IsEmail()
  email: string

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

  @Field()
  @IsString()
  password: string

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
}
