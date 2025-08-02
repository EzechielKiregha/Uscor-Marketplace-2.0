import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { SaleStatus } from 'src/generated/prisma/enums';

// Enums
registerEnumType(SaleStatus, { name: 'SaleStatus' });

@ObjectType()
export class ReturnEntity {
  @Field()
  id: string;

  @Field()
  saleId: string;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  status: SaleStatus;

  @Field()
  createdAt: Date;
}