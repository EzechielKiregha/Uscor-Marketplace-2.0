import { Field, Int, ObjectType } from "@nestjs/graphql";
@ObjectType()
export class SalesStats {
	@Field(() => Int)
	total: number;

	@Field(() => Int)
	monthly: number;

	@Field(() => Int)
	weekly: number;
}
