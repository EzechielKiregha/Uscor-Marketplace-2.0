import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateMarketplaceInput } from "./create-marketplace.input";

@InputType()
export class UpdateMarketplaceInput extends PartialType(
	CreateMarketplaceInput,
) {
	@Field(() => Int)
	id: number;
}
