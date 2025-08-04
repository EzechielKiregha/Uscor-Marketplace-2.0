import { CreateShiftInput } from './create-shift.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateShiftInput extends PartialType(CreateShiftInput) {
  @Field(() => Int)
  id: number;
}
