import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class WorkerPerformance {
  @Field()
  workerId: string;

  @Field()
  workerName: string;

  @Field(() => Float)
  sales: number;

  @Field(() => Float)
  hoursWorked: number;

  @Field(() => Float)
  completionRate: number;
}

@ObjectType()
export class DailySalesReport {
  @Field()
  date: string;

  @Field(() => Float)
  sales: number;

  @Field(() => Int)
  orders: number;
}

@ObjectType()
export class TopProductReport {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  quantitySold: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
export class StoreReportEntity {
  @Field(() => Float)
  totalSales: number;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  averageTicket: number;

  @Field(() => [TopProductReport])
  topProducts: TopProductReport[];

  @Field(() => [WorkerPerformance])
  workerPerformance: WorkerPerformance[];

  @Field(() => [DailySalesReport])
  dailySales: DailySalesReport[];
}
