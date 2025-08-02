import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { IsNumber, IsString, Min } from 'class-validator';

// DTOs
@InputType()
export class CreateRepostedProductInput {
  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsString()
  businessId: string;

  @Field(() => Float, { defaultValue: 0.02 })
  @IsNumber()
  @Min(0)
  markupPercentage: number;
}

