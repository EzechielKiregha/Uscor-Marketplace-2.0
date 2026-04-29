import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BulkImportResultEntity {
	@Field()
	success: boolean;

	@Field(() => Int)
	count: number;
}
