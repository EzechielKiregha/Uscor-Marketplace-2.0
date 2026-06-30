import {
  Field,
  ObjectType,
} from '@nestjs/graphql'

@ObjectType()
export class KycDocumentEntity {
  @Field()
  id: string

  @Field()
  businessId: string

  @Field()
  documentType: string

  @Field()
  documentUrl: string

  @Field()
  status: string

  @Field({ nullable: true })
  rejectionReason?: string

  @Field()
  submittedAt: Date

  @Field({ nullable: true })
  verifiedAt?: Date

  @Field({ nullable: true })
  createdAt?: Date

  @Field({ nullable: true })
  updatedAt?: Date
}
