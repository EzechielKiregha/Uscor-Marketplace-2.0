import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateSettingInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
