import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RejectKycInput {
  @Field()
  @IsString()
  businessId: string;

  @Field()
  @IsString()
  rejectionReason: string;
}