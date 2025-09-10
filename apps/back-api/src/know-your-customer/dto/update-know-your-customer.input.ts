import { CreateKnowYourCustomerInput } from './create-know-your-customer.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
} from '@nestjs/graphql'

@InputType()
export class UpdateKnowYourCustomerInput extends PartialType(
  CreateKnowYourCustomerInput,
) {
  @Field(() => Int)
  id: number
}
