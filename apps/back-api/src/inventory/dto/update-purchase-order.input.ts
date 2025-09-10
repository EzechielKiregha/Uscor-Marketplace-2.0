import {
  Field,
  InputType,
  Int,
  registerEnumType,
} from '@nestjs/graphql'
import {
  IsString,
  IsOptional,
  IsDate,
  IsArray,
  IsEnum,
} from 'class-validator'
import { PurchaseOrderStatus } from '../../generated/prisma/enums'
import { PurchaseOrderProductInput } from './create-purchase-order-product.input'

// Enums
registerEnumType(PurchaseOrderStatus, {
  name: 'PurchaseOrderStatus',
})

@InputType()
export class UpdatePurchaseOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expectedDelivery?: Date

  @Field(() => PurchaseOrderStatus, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus

  @Field(() => [PurchaseOrderProductInput], {
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  products?: PurchaseOrderProductInput[]
}
