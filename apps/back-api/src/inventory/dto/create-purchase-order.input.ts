import { Field, InputType } from "@nestjs/graphql";
import { IsString, IsOptional, IsDate, IsArray } from "class-validator";
import { PurchaseOrderProductInput } from "./create-purchase-order-product.input";

// DTOs
@InputType()
export class CreatePurchaseOrderInput {
  @Field()
  @IsString()
  businessId: string;

  @Field()
  @IsString()
  storeId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expectedDelivery?: Date;

  @Field(() => [PurchaseOrderProductInput])
  @IsArray()
  products: PurchaseOrderProductInput[];
}