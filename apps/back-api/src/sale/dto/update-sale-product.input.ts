import { InputType, Field } from '@nestjs/graphql';
import { IsNumber, IsOptional, Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateSaleProductInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  modifiers?: any;
}