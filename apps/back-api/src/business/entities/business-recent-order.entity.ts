import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DashboardClientDto } from './business-client.entity ';

@ObjectType()
export class RecentOrder {
  @Field()
  id: string;
  
  @Field(() => DashboardClientDto)
  client: DashboardClientDto;
  
  @Field()
  createdAt: Date;
  
  @Field(()=> Int)
  totalAmount: number;
  
  @Field()
  status: string;
}