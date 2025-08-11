import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';

@ObjectType()
export class StoreEntity {
  @Field()
  id: string;

  @Field()
  businessId: string;

  @Field(() => BusinessEntity)
  business: BusinessEntity;

  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

