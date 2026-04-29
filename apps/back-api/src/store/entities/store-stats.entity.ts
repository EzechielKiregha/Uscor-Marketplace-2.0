import { Field, ObjectType } from "@nestjs/graphql";
import { ProductStats } from "./store-product-stats.entity";
import { RevenueStats } from "./store-revenue-stats.entity";
import { SalesStats } from "./store-sales-stats.entity";

@ObjectType()
export class StoreStatistics {
	@Field(() => SalesStats)
	sales: SalesStats;

	@Field(() => RevenueStats)
	revenue: RevenueStats;

	@Field(() => ProductStats)
	products: ProductStats;
}
