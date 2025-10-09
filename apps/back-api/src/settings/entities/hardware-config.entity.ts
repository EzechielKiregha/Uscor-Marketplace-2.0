import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class HardwareConfigEntity {
  @Field()
  id: string

  @Field({ nullable: true })
  receiptPrinter?: string

  @Field({ nullable: true })
  barcodeScanner?: string

  @Field({ nullable: true })
  cashDrawer?: string

  @Field({ nullable: true })
  cardReader?: string
}
