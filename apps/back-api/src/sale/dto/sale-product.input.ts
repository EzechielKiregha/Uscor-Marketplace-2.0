import {
  InputType,
  Int,
  Field,
  Float,
} from '@nestjs/graphql'
import {
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import GraphQLJSON from 'graphql-type-json'

// DTOs
@InputType()
export class SaleProductInput {
  @Field()
  @IsString()
  productId: string

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  modifiers?: any
}
