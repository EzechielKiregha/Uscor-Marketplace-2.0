import { Field, ObjectType } from "@nestjs/graphql";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class SaleProductEntityWorker {
	@Field()
	id: string;

	@Field()
	saleId: string;

	@Field()
	productId: string;

	@Field(() => ProductEntity, { nullable: true })
	product?: ProductEntity;

	@Field()
	quantity: number;

	@Field()
	price: number;

	@Field({ nullable: true })
	modifiers?: string;

	@Field()
	createdAt: Date;
}
