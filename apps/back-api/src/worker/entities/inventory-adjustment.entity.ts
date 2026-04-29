import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { ProductEntity } from "../../product/entities/product.entity";
import { StoreEntity } from "../../store/entities/store.entity";
import { AdjustmentType } from "../dto/create-inventory-adjustment.input";

registerEnumType(AdjustmentType, {
	name: "AdjustmentType",
});

@ObjectType()
export class InventoryAdjustmentEntity {
	@Field()
	id: string;

	@Field()
	productId: string;

	@Field(() => ProductEntity, { nullable: true })
	product?: ProductEntity;

	@Field()
	storeId: string;

	@Field(() => StoreEntity, { nullable: true })
	store?: StoreEntity;

	@Field(() => AdjustmentType)
	adjustmentType: AdjustmentType;

	@Field()
	quantity: number;

	@Field({ nullable: true })
	reason?: string;

	@Field()
	createdAt: Date;
}
