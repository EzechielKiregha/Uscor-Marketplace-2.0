import { Field, Float, Int, ObjectType } from '@nestjs/graphql';


@ObjectType()
export class DashboardStats {
  @Field(()=> Float)
  totalRevenue: number;
  
  @Field(()=> Int)
  revenueChange: number;
  
  @Field(()=> Int)
  totalOrders: number;
  
  @Field(()=> Int)
  ordersChange: number;
  
  @Field(()=> Int)
  totalProducts: number;
  
  @Field(()=> Int)
  lowStockProducts: number;
  
  @Field(()=> Int)
  unreadMessages: number;
  
  @Field(()=> Int)
  totalMessages: number;
}
