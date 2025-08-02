import { CreateReOwnedProductInput } from './create-re-owned-product.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReOwnedProductInput extends PartialType(CreateReOwnedProductInput) {
  @Field(() => Int)
  id: number;
}
