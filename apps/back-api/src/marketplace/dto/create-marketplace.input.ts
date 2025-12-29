import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMarketplaceInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
