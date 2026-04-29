import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductStats {
	@Field(() => Int)
	total: number;

	@Field(() => Int)
	lowStock: number;
}
