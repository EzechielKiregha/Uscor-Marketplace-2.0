import { InputType, Field, GraphQLISODateTime } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'
import { IsOptional, IsString, IsDateString, IsObject, IsISO8601 } from 'class-validator'

@InputType()
export class CreateAnnouncementInput {
  @Field()
  @IsString()
  title: string

  @Field()
  @IsString()
  content: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  type?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  priority?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetUsers?: string
}