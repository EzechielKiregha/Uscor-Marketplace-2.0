import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { SaleStatus } from '../../generated/prisma/enums';
import { SaleEntity } from './sale.entity';

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

  @Field(() => SaleStatus)
  status: SaleStatus;

  @Field()
  createdAt: Date;

  @Field(() => SaleEntity)
    sale: SaleEntity;
}