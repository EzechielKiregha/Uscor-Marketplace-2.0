import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsOptional, IsArray, IsEnum } from "class-validator";
import { TransferOrderStatus } from "../../generated/prisma/enums";
import { TransferOrderProductInput } from "./create-transfer-order-product.input";


// Enums
registerEnumType(TransferOrderStatus, { name: 'TransferOrderStatus' });

@InputType()
export class UpdateTransferOrderInput {
  @Field(() => TransferOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TransferOrderStatus)
  status?: TransferOrderStatus;

  @Field(() => [TransferOrderProductInput], { nullable: true })
  @IsOptional()
  @IsArray()
  products?: TransferOrderProductInput[];
}