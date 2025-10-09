import { CreateSettingInput } from './create-setting.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSettingInput extends PartialType(CreateSettingInput) {
  @Field(() => Int)
  id: number;
}
