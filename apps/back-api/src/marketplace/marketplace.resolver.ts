import { Inject } from "@nestjs/common";
import {
	Args,
	Float,
	Int,
	Query,
	Resolver,
	Subscription,
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { BusinessTypeEntity } from "../business/entities/business-type.entity";
import { CategoryEntity } from "../category/entities/category.entity";
import {
	FreelanceServiceEntity,
	PaginatedFreelanceServicesResponse,
} from "../freelance-service/entities/freelance-service.entity";
import { ProductEntity } from "../product/entities/product.entity";
import { FeaturedStoresResponse } from "./dto/featured-stores.response";
import { PaginatedProductsResponse } from "./dto/paginated-products.response";
import { SearchMarketplaceResponse } from "./dto/search-marketplace.response";
import { MarketplaceService } from "./marketplace.service";

@Resolver()
export class MarketplaceResolver {
	constructor(
		private readonly marketplaceService: MarketplaceService,
		@Inject("PUB_SUB")
		private readonly pubSub: PubSub,
	) {}

	@Query(() => PaginatedProductsResponse, { name: "marketplaceProducts" })
	async marketplaceProducts(
		@Args("search", { type: () => String, nullable: true }) search?: string,
		@Args("category", { type: () => String, nullable: true }) category?: string,
		@Args("businessType", { type: () => String, nullable: true }) businessType?: string,
		@Args("hasPromotion", { type: () => Boolean, nullable: true }) hasPromotion?: boolean,
		@Args("isFeatured", { type: () => Boolean, nullable: true }) isFeatured?: boolean,
		@Args("minPrice", { type: () => Float, nullable: true }) minPrice?: number,
		@Args("maxPrice", { type: () => Float, nullable: true }) maxPrice?: number,
		@Args("sort", { type: () => String, nullable: true }) sort?: string,
		@Args("page", { type: () => Int, defaultValue: 1 }) page = 1,
		@Args("limit", { type: () => Int, defaultValue: 12 }) limit = 12,
	) {
		return this.marketplaceService.getProducts({
			search, category, businessType, hasPromotion, isFeatured,
			minPrice, maxPrice, sort, page, limit,
		});
	}

	@Query(() => PaginatedFreelanceServicesResponse, { name: "marketplaceServices" })
	async marketplaceServices(
		@Args("search", { type: () => String, nullable: true }) search?: string,
		@Args("category", { type: () => String, nullable: true }) category?: string,
		@Args("businessType", { type: () => String, nullable: true }) businessType?: string,
		@Args("minPrice", { type: () => Float, nullable: true }) minPrice?: number,
		@Args("maxPrice", { type: () => Float, nullable: true }) maxPrice?: number,
		@Args("sort", { type: () => String, nullable: true }) sort?: string,
		@Args("page", { type: () => Int, defaultValue: 1 }) page = 1,
		@Args("limit", { type: () => Int, defaultValue: 12 }) limit = 12,
	) {
		return this.marketplaceService.getServices({
			search, category, businessType, minPrice, maxPrice, sort, page, limit,
		});
	}

	@Query(() => [BusinessTypeEntity], { name: "businessTypes" })
	async businessTypes() {
		return this.marketplaceService.getBusinessTypes();
	}

	@Query(() => [CategoryEntity], { name: "productCategories" })
	async productCategories() {
		return this.marketplaceService.getProductCategories();
	}

	@Query(() => SearchMarketplaceResponse)
	async searchMarketplace(@Args("query") query: string) {
		return this.marketplaceService.searchMarketplace(query);
	}

	// ─── New Phase 5 queries ───────────────────────────────────

	@Query(() => FeaturedStoresResponse, { name: "featuredStores" })
	async featuredStores(
		@Args("limit", { type: () => Int, defaultValue: 8 }) limit = 8,
	) {
		return this.marketplaceService.getFeaturedStores(limit);
	}

	@Query(() => PaginatedProductsResponse, { name: "productsByBusinessType" })
	async productsByBusinessType(
		@Args("businessType") businessType: string,
		@Args("limit", { type: () => Int, defaultValue: 8 }) limit = 8,
	) {
		return this.marketplaceService.getProductsByType(businessType, limit);
	}

	// ─── Subscriptions ─────────────────────────────────────────

	@Subscription(() => ProductEntity, {
		filter: (payload, variables) =>
			variables.businessId == null || payload.businessId === variables.businessId,
		resolve: (payload) => payload.productCreated,
	})
	productAdded(
		@Args("businessId", { type: () => String, nullable: true })
		_businessId?: string,
	) {
		return this.pubSub.asyncIterableIterator("productCreated");
	}

	@Subscription(() => FreelanceServiceEntity, {
		filter: (payload, variables) =>
			variables.businessId == null || payload.businessId === variables.businessId,
		resolve: (payload) => payload.freelanceServiceCreated,
	})
	serviceAdded(
		@Args("businessId", { type: () => String, nullable: true })
		_businessId?: string,
	) {
		return this.pubSub.asyncIterableIterator("freelanceServiceCreated");
	}
}
