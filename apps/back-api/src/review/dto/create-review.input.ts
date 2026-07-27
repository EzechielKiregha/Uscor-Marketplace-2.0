import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateReviewInput {
	@Field()
	clientId: string;

	@Field()
	productId: string;

	@Field(() => Int)
	rating: number;

	@Field({ nullable: true })
	comment?: string;
}
