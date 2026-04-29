import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateReviewInput } from "./create-review.input";

@InputType()
export class UpdateReviewInput extends PartialType(CreateReviewInput) {
	@Field(() => Int)
	id: number;
}
