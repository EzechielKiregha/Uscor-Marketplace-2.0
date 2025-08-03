import { InputType, Int, Field, registerEnumType } from '@nestjs/graphql';
import { IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { AdjustmentType, PurchaseOrderStatus, TransferOrderStatus } from 'src/generated/prisma/enums';

// Enums
registerEnumType(PurchaseOrderStatus, { name: 'PurchaseOrderStatus' });
registerEnumType(TransferOrderStatus, { name: 'TransferOrderStatus' });
registerEnumType(AdjustmentType, { name: 'AdjustmentType' });

@InputType()
export class CreateInventoryAdjustmentInput {
  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsString()
  storeId: string;

  @Field(() => AdjustmentType)
  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}
