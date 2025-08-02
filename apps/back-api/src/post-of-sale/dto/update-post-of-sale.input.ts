import { CreatePostOfSaleInput } from './create-post-of-sale.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePostOfSaleInput extends PartialType(CreatePostOfSaleInput) {
  @Field(() => Int)
  id: number;
}
