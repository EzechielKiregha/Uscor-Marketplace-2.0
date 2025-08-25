import { Field, ObjectType } from '@nestjs/graphql';
import { DashboardStats } from './business-dashboard-stats.entity';
import { SalesDataPoint } from './sales-data-points.entity';
import { RecentOrder } from './business-recent-order.entity';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class BusinessDashboardResponse {
  @ApiProperty({ type: DashboardStats })
  @Field(()=> DashboardStats)
  stats: DashboardStats;
  
  @ApiProperty({ type: [SalesDataPoint] })
  @Field(()=>[SalesDataPoint])
  salesData: SalesDataPoint[];
  
  @ApiProperty({ type: [RecentOrder] })
  @Field(()=> [RecentOrder] )
  recentOrders: RecentOrder[];
}