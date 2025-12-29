import { CreatePlatformInput } from './create-platform.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePlatformInput extends PartialType(CreatePlatformInput) {
  @Field(() => Int)
  id: number;
}
