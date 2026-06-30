import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FeaturedStoreItem {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field({ nullable: true })
	avatar?: string;

	@Field({ nullable: true })
	businessType?: string;

	@Field({ nullable: true })
	kycStatus?: string;

	@Field()
	isVerified: boolean;

	@Field(() => Int)
	totalSales: number;

	@Field(() => Int)
	totalProductsSold: number;

	@Field(() => Int)
	productCount: number;
}

@ObjectType()
export class FeaturedStoresResponse {
	@Field(() => [FeaturedStoreItem])
	items: FeaturedStoreItem[];
}
