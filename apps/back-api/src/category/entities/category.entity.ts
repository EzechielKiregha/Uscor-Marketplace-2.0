import { Field, ObjectType } from "@nestjs/graphql";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class CategoryEntity {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field(() => String, { nullable: true })
	description?: string | null;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => [ProductEntity], {
		nullable: true,
	})
	products?: ProductEntity[];
}
