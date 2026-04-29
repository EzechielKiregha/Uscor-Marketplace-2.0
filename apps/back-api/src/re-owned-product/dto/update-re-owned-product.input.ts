import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateReOwnedProductInput } from "./create-re-owned-product.input";

@InputType()
export class UpdateReOwnedProductInput extends PartialType(
	CreateReOwnedProductInput,
) {
	@Field(() => Int)
	id: number;
}
