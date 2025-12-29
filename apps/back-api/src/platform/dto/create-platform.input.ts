import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePlatformInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
