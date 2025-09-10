import {
  InputType,
  Int,
  Field,
} from '@nestjs/graphql'

@InputType()
export class CreateChatNessageInput {
  @Field(() => Int, {
    description: 'Example field (placeholder)',
  })
  exampleField: number
}
