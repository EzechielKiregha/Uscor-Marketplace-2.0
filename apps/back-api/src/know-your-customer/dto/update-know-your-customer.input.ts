import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateKnowYourCustomerInput } from "./create-know-your-customer.input";

@InputType()
export class UpdateKnowYourCustomerInput extends PartialType(
	CreateKnowYourCustomerInput,
) {
	@Field(() => Int)
	id: number;
}
