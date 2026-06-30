import { Field, InputType } from '@nestjs/graphql'
import {
  IsOptional,
  IsString,
} from 'class-validator'

@InputType()
export class RejectKycInput {
  @Field()
  @IsString()
  businessId: string

  @Field()
  @IsString()
  rejectionReason: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  documentUrl?: string
}
