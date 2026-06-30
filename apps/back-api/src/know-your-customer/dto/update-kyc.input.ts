import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class UpdateKycInput {
  @Field()
  @IsString()
  businessId: string

  @Field()
  @IsString()
  documentUrl: string
}
