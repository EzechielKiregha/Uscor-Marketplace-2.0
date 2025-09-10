import { CreateAdInput } from './create-ad.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
} from '@nestjs/graphql'

@InputType()
export class UpdateAdInput extends PartialType(
  CreateAdInput,
) {
  @Field(() => Int)
  id: number
}
