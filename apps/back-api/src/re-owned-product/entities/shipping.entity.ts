import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ShippingEntity {
  @Field()
  id: string;

  @Field()
  reOwnedProductId: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  trackingNumber?: string;

  @Field({ nullable: true })
  carrier?: string;

  @Field({ nullable: true })
  shippedAt?: Date;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field()
  createdAt: Date;
}


