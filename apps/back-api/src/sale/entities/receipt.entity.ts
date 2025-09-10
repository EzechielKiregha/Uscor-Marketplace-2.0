import {
  ObjectType,
  Field,
  registerEnumType,
} from '@nestjs/graphql'
import { SaleStatus } from '../../generated/prisma/enums'

// Enums
registerEnumType(SaleStatus, {
  name: 'SaleStatus',
})

@ObjectType()
export class ReceiptEntity {
  @Field()
  filePath: string

  @Field({ nullable: true })
  emailSent?: boolean
}
