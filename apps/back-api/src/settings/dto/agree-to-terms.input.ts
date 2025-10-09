import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class AgreeToTermsInput {
  @Field()
  businessId: string
}
