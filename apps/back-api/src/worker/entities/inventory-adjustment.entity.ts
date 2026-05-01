import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { ProductEntity } from "../../product/entities/product.entity";
import { StoreEntity } from "../../store/entities/store.entity";
import { AdjustmentType } from "../../generated/prisma/enums";

registerEnumType(AdjustmentType, {
	name: "AdjustmentType",
});

@ObjectType()
export class InventoryAdjustmentEntityWorker {
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

	@Field({ nullable: true })
	createdAt: Date;

	@Field({ nullable: true })
	updatedAt: Date;
}
