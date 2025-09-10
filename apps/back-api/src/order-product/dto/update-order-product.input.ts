import { CreateOrderProductInput } from './create-order-product.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
} from '@nestjs/graphql'

@InputType()
export class UpdateOrderProductInput extends PartialType(
  CreateOrderProductInput,
) {
  @Field(() => Int)
  id: number
}
