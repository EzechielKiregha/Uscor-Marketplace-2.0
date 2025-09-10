import {
  InputType,
  Int,
  Field,
} from '@nestjs/graphql'
import {
  IsOptional,
  IsString,
} from 'class-validator'

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsString()
  name: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string
}
