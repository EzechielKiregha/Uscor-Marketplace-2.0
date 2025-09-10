import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class AddMediaInput {
  @Field(() => String)
  url: string

  @Field(() => String)
  type: string
}
