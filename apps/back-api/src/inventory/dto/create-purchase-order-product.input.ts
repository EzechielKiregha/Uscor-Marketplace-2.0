import {
  Field,
  InputType,
  Int,
} from '@nestjs/graphql'
import {
  IsString,
  IsNumber,
  Min,
} from 'class-validator'

@InputType()
export class PurchaseOrderProductInput {
  @Field()
  @IsString()
  productId: string

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number
}
