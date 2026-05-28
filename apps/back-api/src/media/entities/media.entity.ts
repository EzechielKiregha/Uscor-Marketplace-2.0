import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class MediaEntity {
	@Field()
	id: string;

	@Field()
	url: string;

	@Field()
	type: string; // MediaType (e.g., IMAGE, VIDEO)

	@Field()
	productId: string;

	@Field()
	createdAt: Date;

	@Field()
	pathname: string;

	@Field(() => Int)
	size: bigint;

	// Relations
	@Field(() => ProductEntity) // Product associated with the media
	product: ProductEntity;
}
