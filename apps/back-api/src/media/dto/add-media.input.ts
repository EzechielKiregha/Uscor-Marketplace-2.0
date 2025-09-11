import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsInt, IsOptional } from 'class-validator';

@InputType()
export class AddMediaInput {
  @Field()
  @IsString()
  url: string;

  @Field()
  @IsString()
  pathname: string;

  @Field()
  @IsString()
  type: string;

  @Field(() => Int)
  @IsInt()
  size: number;
}
