import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import {
  InputType,
  Field,
  Float,
} from '@nestjs/graphql'

@InputType()
export class UpdateFreelanceServiceInput {
  @Field()
  @IsString()
  id: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isHourly?: boolean

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  workerIds?: string[]
}
