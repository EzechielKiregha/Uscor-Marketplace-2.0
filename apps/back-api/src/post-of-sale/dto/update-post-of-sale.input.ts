import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreatePostOfSaleInput } from "./create-post-of-sale.input";

@InputType()
export class UpdatePostOfSaleInput extends PartialType(CreatePostOfSaleInput) {
	@Field(() => Int)
	id: number;
}
