import { CreateMarketplaceInput } from './create-marketplace.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMarketplaceInput extends PartialType(CreateMarketplaceInput) {
  @Field(() => Int)
  id: number;
}
