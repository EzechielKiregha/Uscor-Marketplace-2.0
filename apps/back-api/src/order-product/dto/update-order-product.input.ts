import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateOrderProductInput } from "./create-order-product.input";

@InputType()
export class UpdateOrderProductInput extends PartialType(
	CreateOrderProductInput,
) {
	@Field(() => Int)
	id: number;
}
