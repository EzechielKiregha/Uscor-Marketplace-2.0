import { InputType, Int, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';


// DTOs
@InputType()
export class CreateStoreInput {
  @Field()
  @IsString()
  businessId: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;
}


