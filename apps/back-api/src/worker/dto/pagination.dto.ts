import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, Max, Min } from "class-validator";

@ObjectType()
export class PaginationMeta {
	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;

	@Field(() => Int)
	pages: number;
}

@InputType()
export class PaginationInput {
	@Field(() => Int, { defaultValue: 1 })
	@IsNumber()
	@Min(1)
	page: number = 1;

	@Field(() => Int, { defaultValue: 20 })
	@IsNumber()
	@Min(1)
	@Max(100)
	limit: number = 20;
}
