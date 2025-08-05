import { IsDate, IsOptional } from 'class-validator';
import { CreateShiftInput } from './create-shift.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShiftInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  startTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  endTime?: Date;
}

