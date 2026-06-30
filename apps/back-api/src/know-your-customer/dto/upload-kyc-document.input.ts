import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class UploadKycDocumentInput {
  @Field()
  @IsString()
  businessId: string

  @Field()
  @IsString()
  documentType: string

  @Field()
  @IsString()
  documentUrl: string
}
