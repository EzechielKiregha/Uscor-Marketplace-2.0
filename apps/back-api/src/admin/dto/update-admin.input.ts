import { InputType, Field } from '@nestjs/graphql'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class UpdateAdminInput {
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    fullName?: string
    
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