import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PostOfSaleEntity {
	@Field()
	id: string;

	@Field()
	title: string;

	@Field({ nullable: true })
	description?: string;

	@Field()
	price: number;

	@Field()
	status: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
