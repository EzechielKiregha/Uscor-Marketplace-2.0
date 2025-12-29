import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdateUserStatusInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  userType: string;

  @Field()
  @IsString()
  status: string;
}