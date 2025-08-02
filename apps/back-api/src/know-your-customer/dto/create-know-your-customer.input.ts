import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateKnowYourCustomerInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
