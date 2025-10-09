import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class UploadKycDocumentInput {
  @Field()
  businessId: string

  @Field()
  documentType: string

  @Field()
  documentUrl: string
}
