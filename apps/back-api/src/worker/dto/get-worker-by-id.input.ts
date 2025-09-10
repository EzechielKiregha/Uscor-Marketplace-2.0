import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class WorkerIDInput {
  @Field(() => String)
  id: string
}
