import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { BusinessEntity } from "../../business/entities/business.entity";
import { ProductEntity } from "../../product/entities/product.entity";

// New Entity
@ObjectType()
export class OrderBusinessGroupEntity {
	@Field()
	id: string;

	@Field()
	orderId: string;

	@Field()
	businessId: string;

	@Field(() => BusinessEntity)
	business: BusinessEntity;

	@Field(() => Float)
	subtotal: number;

	@Field(() => Float)
	deliveryFee: number;

	@Field(() => Float)
	total: number;

	@Field()
	status: string;

	@Field(() => [OrderItem])
	items: OrderItem[];

	@Field()
	createdAt: Date;
}

@ObjectType()
export class OrderItem {
	@Field()
	id: string;

	@Field()
	productId: string;

	@Field(() => Int)
	quantity: number;

	@Field(() => Float)
	price: number;

	@Field(() => ProductEntity) // or your ProductEntity
	product: ProductEntity;
}