import { IsDate, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

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

