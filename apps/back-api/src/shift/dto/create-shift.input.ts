import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateShiftInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
