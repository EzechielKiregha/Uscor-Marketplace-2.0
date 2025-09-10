import { InputType, Field, Int } from '@nestjs/graphql'

@InputType()
export class AddMediaInput {
  @Field(() => String)
  url: string

  @Field(() => String)
  type: string

  @Field(() => Int, {nullable: true})
  size?: number

  @Field({nullable: true})
  pathname: string
}
