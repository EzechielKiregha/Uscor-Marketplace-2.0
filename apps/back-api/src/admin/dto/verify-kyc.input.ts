import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class VerifyKycInput {
  @Field()
  @IsString()
  businessId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}