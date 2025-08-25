import { ApiProperty } from '@nestjs/swagger';

export class SalesDataPoint {
  @ApiProperty()
  date: string;
  
  @ApiProperty()
  sales: number;
}

export class DashboardStats {
  @ApiProperty()
  totalRevenue: number;
  
  @ApiProperty()
  revenueChange: number;
  
  @ApiProperty()
  totalOrders: number;
  
  @ApiProperty()
  ordersChange: number;
  
  @ApiProperty()
  totalProducts: number;
  
  @ApiProperty()
  lowStockProducts: number;
  
  @ApiProperty()
  unreadMessages: number;
  
  @ApiProperty()
  totalMessages: number;
}

export class RecentOrder {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  client: {
    fullName: string;
  };
  
  @ApiProperty()
  createdAt: Date;
  
  @ApiProperty()
  totalAmount: number;
  
  @ApiProperty()
  status: string;
}

export class BusinessDashboardResponse {
  @ApiProperty({ type: DashboardStats })
  stats: DashboardStats;
  
  @ApiProperty({ type: [SalesDataPoint] })
  salesData: SalesDataPoint[];
  
  @ApiProperty({ type: [RecentOrder] })
  recentOrders: RecentOrder[];
}