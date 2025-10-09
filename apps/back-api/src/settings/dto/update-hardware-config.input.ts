import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class UpdateHardwareConfigInput {

  @Field({ nullable: true })
  receiptPrinter?: string

  @Field({ nullable: true })
  barcodeScanner?: string

  @Field({ nullable: true })
  cashDrawer?: string

  @Field({ nullable: true })
  cardReader?: string
}
