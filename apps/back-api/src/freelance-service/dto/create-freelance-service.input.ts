import { InputType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum FreelanceServiceCategory {
  PLUMBER = 'PLUMBER',
  ELECTRICIAN = 'ELECTRICIAN',
  CARPENTER = 'CARPENTER',
  MECHANIC = 'MECHANIC',
  TUTOR = 'TUTOR',
  CLEANER = 'CLEANER',
  OTHER = 'OTHER'
}


registerEnumType(FreelanceServiceCategory, { name: 'FreelanceServiceCategory' });

// DTOs
@InputType()
export class CreateFreelanceServiceInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  isHourly: boolean;

  @Field(() => FreelanceServiceCategory )
  @IsEnum(FreelanceServiceCategory)
  category : FreelanceServiceCategory

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  rate: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  workerIds?: string[];
}



@InputType()
export class AssignWorkersInput {
  @Field()
  @IsString()
  serviceId: string;

  @Field(() => [String])
  @IsArray()
  workerIds: string[];
}
