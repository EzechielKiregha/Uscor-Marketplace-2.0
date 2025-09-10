import { CreateRepostedProductInput } from './create-reposted-product.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
} from '@nestjs/graphql'

@InputType()
export class UpdateRepostedProductInput extends PartialType(
  CreateRepostedProductInput,
) {
  @Field(() => Int)
  id: number
}
