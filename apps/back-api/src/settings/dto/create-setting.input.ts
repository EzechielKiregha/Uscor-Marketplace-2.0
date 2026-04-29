import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateSettingInput {
	@Field(() => Int, {
		description: "Example field (placeholder)",
	})
	exampleField: number;
}
