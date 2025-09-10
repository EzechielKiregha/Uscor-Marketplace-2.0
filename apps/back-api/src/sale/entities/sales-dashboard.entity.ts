import {
  ObjectType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql'

@ObjectType()
export class TopProduct {
  @Field()
  id: string

  @Field()
  title: string

  @Field(() => Int)
  quantitySold: number
}

@ObjectType()
export class PaymentMethodStat {
  @Field()
  method: string

  @Field(() => Int)
  count: number

  @Field(() => Float)
  amount: number
}

@ObjectType()
export class ChartDataPoint {
  @Field()
  name: string

  @Field(() => Float)
  sales: number

  @Field(() => Int)
  transactions: number
}

@ObjectType()
export class SalesDashboard {
  @Field(() => Int)
  totalSales: number

  @Field(() => Float)
  totalRevenue: number

  @Field(() => Float)
  averageTicket: number

  @Field(() => [TopProduct])
  topProducts: TopProduct[]

  @Field(() => [PaymentMethodStat])
  paymentMethods: PaymentMethodStat[]

  @Field(() => [ChartDataPoint])
  chartData: ChartDataPoint[]
}
