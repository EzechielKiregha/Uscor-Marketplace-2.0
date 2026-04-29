import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateRepostedProductInput } from "./create-reposted-product.input";

@InputType()
export class UpdateRepostedProductInput extends PartialType(
	CreateRepostedProductInput,
) {
	@Field(() => Int)
	id: number;
}
