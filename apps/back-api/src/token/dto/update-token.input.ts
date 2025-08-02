import { CreateTokenInput } from './create-token.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTokenInput extends PartialType(CreateTokenInput) {
  @Field(() => Int)
  id: number;
}
