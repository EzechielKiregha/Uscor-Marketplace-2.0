import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EscrowStatus, FreelanceStatus } from './create-freelance-order.input';
import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdateFreelanceOrderInput {

  @Field(() => FreelanceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(FreelanceStatus)
  status?: FreelanceStatus;

  @Field(() => EscrowStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EscrowStatus)
  escrowStatus?: EscrowStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionPercent?: number;
}

@InputType()
export class AssignBusinessesInput {
  @Field()
  @IsString()
  orderId: string;

  @Field(() => [String])
  @IsArray()
  businessIds: string[];
}

