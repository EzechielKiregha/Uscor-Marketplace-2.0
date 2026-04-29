import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsString } from "class-validator";
import { TransferOrderProductInput } from "./create-transfer-order-product.input";

@InputType()
export class CreateTransferOrderInput {
	@Field()
	@IsString()
	fromStoreId: string;

	@Field()
	@IsString()
	toStoreId: string;

	@Field(() => [TransferOrderProductInput])
	@IsArray()
	products: TransferOrderProductInput[];
}
