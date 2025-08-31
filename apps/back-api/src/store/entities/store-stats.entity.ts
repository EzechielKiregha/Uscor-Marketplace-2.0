import { ObjectType, Field, Int } from '@nestjs/graphql';
import { SalesStats } from './store-sales-stats.entity';
import { ProductStats } from './store-product-stats.entity';
import { RevenueStats } from './store-revenue-stats.entity';

@ObjectType()
export class StoreStatistics {
  @Field(() => SalesStats)
  sales: SalesStats;

  @Field(() => RevenueStats)
  revenue: RevenueStats;

  @Field(() => ProductStats)
  products: ProductStats;
}
