import { InputType, Field, Int, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { KycStatus } from '../../business/dto/update-business.input';

@InputType()
export class GetUsersInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userType?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => KycStatus, { nullable: true })
  @IsOptional()
  @IsString()
  kycStatus?: KycStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  businessType?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}