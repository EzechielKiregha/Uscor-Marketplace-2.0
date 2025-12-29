import { InputType, Field } from '@nestjs/graphql'
import { IsEmail, IsJSON, IsOptional, IsString } from 'class-validator'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class CreateAdminInput {
  @Field()
  @IsEmail()
  email: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string

  @Field()
  @IsString()
  password: string
  
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string
  
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsJSON()
  permissions?: any
}