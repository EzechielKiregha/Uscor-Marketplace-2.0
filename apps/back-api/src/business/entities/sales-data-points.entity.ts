import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SalesDataPoint {
  @Field()
  date: string;
  
  @Field(()=> Int)
  sales: number;
}