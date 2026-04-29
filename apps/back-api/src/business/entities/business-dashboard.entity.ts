import { Field, ObjectType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { DashboardStats } from "./business-dashboard-stats.entity";
import { RecentOrder } from "./business-recent-order.entity";
import { SalesDataPoint } from "./sales-data-points.entity";

@ObjectType()
export class BusinessDashboardResponse {
	@ApiProperty({ type: DashboardStats })
	@Field(() => DashboardStats)
	stats: DashboardStats;

	@ApiProperty({ type: [SalesDataPoint] })
	@Field(() => [SalesDataPoint])
	salesData: SalesDataPoint[];

	@ApiProperty({ type: [RecentOrder] })
	@Field(() => [RecentOrder])
	recentOrders: RecentOrder[];
}
