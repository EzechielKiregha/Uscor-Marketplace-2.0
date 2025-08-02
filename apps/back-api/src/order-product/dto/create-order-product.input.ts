import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateOrderProductInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
