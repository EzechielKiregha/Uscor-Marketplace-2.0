import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateKnowYourCustomerInput {
	@Field(() => Int, {
		description: "Example field (placeholder)",
	})
	exampleField: number;
}
