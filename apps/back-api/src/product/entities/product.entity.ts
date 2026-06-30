import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { AdEntity } from "../../ad/entities/ad.entity";
import { BusinessEntity } from "../../business/entities/business.entity";
import { CategoryEntity } from "../../category/entities/category.entity";
import { ChatEntity } from "../../chat/entities/chat.entity";
import { PromotionEntity } from "../../client/entities/promotion.entity";
import { MediaEntity } from "../../media/entities/media.entity";
import { OrderProductEntity } from "../../order-product/entities/order-product.entity";
import { ReOwnedProductEntity } from "../../re-owned-product/entities/re-owned-product.entity";
import { RepostedProductEntity } from "../../reposted-product/entities/reposted-product.entity";
import { ReviewEntity } from "../../review/entities/review.entity";
import { StoreEntity } from "../../store/entities/store.entity";
@ObjectType()
export class ProductEntity {
	@Field()
	id: string;

	@Field()
	title: string;

	// Backwards-compatible 'name' field used by frontend queries
	@Field({ nullable: true })
	name?: string;

	@Field(() => String, { nullable: true })
	description?: string | null;

	@Field(() => Float)
	price: number;

	// Frontend expects 'stockQuantity'
	@Field(() => Int, { nullable: true })
	stockQuantity?: number;

	@Field(() => Int, { nullable: true })
	minQuantity?: number;

	@Field(() => Int, { nullable: true })
	quantity?: number;

	// A single primary media object for lists
	@Field(() => MediaEntity, { nullable: true })
	media?: MediaEntity;

	@Field()
	businessId: string;

	@Field(() => String,{ nullable: true })
	storeId?: string | null;

	@Field()
	isPhysical: boolean;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => Boolean)
	featured: boolean;

	@Field(() => Boolean)
	approvedForSale: boolean;

	// Business-type-specific fields
	@Field(() => String, { nullable: true })
	brand?: string | null;

	@Field(() => String, { nullable: true })
	serialNumber?: string | null;

	@Field(() => String, { nullable: true })
	imei?: string | null;

	@Field(() => Int, { nullable: true })
	warrantyMonths?: number | null;

	@Field(() => String, { nullable: true })
	sku?: string | null;

	@Field(() => String, { nullable: true })
	barcode?: string | null;

	@Field(() => GraphQLJSON, { nullable: true })
	variants?: any;

	// Relations
	@Field(() => [MediaEntity], { nullable: true }) // Media associated with the product
	medias?: MediaEntity[];

	@Field(() => BusinessEntity, { nullable: true })
	business?: BusinessEntity;

	@Field(() => StoreEntity, { nullable: true })
	store?: StoreEntity;

	@Field(() => CategoryEntity, { nullable: true })
	category?: CategoryEntity;

	@Field(() => [ReviewEntity], { nullable: true}) // Reviews for the product
	reviews?: ReviewEntity[];

	@Field(() => [OrderProductEntity], { nullable: true}) // Orders containing the product
	orders?: OrderProductEntity[];

	@Field(() => [ChatEntity], { nullable: true}) // Chats related to the product
	chats?: ChatEntity[];

	@Field(() => [RepostedProductEntity], { nullable: true}) // Reposted versions of the product
	reposts?: RepostedProductEntity[];

	@Field(() => [ReOwnedProductEntity], { nullable: true}) // Reowned versions of the product
	reowns?: ReOwnedProductEntity[];

	@Field(() => [AdEntity], { nullable: true}) // Ads for the product
	ads?: AdEntity[];

	@Field(() => [PromotionEntity], {
		nullable: true,
	})
	promotions?: PromotionEntity[];
}
