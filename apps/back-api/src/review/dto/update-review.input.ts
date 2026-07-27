import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class UpdateReviewInput {
	@Field(() => Int, { nullable: true })
	rating?: number;

	@Field({ nullable: true })
	comment?: string;
}
