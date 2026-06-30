import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class WholesalePriceEntity {
	@Field() id: string;
	@Field() productId: string;
	@Field() businessId: string;
	@Field(() => Int) minQuantity: number;
	@Field(() => Float) price: number;
	@Field(() => Int, { nullable: true }) maxQuantity?: number;
	@Field({ nullable: true }) businessTypeRestriction?: string;
	@Field() isActive: boolean;
	@Field() createdAt: Date;
	@Field() updatedAt: Date;
}
