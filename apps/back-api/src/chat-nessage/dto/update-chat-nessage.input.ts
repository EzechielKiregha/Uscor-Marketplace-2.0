import { CreateChatNessageInput } from './create-chat-nessage.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateChatNessageInput extends PartialType(CreateChatNessageInput) {
  @Field(() => Int)
  id: number;
}
