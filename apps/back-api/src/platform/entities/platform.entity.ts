import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Platform {
	@Field(() => Int, {
		description: "Example field (placeholder)",
	})
	exampleField: number;
}
