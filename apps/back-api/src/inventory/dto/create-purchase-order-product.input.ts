import { Field, InputType, Int, registerEnumType } from "@nestjs/graphql";
import { IsString, IsOptional, IsDate, IsArray, IsEnum, IsNumber, Min } from "class-validator";
import { PurchaseOrderStatus, TransferOrderStatus, AdjustmentType } from "src/generated/prisma/enums";

@InputType()
export class PurchaseOrderProductInput {
  @Field()
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}
