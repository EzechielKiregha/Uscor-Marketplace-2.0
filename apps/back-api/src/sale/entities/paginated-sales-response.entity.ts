import { ObjectType, Field, Int } from '@nestjs/graphql';
import { SaleEntity } from './sale.entity';

@ObjectType()
export class PaginatedSalesResponse {
  @Field(() => [SaleEntity])
  items: SaleEntity[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}