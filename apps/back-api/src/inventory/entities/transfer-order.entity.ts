import { ObjectType, Field, Int } from '@nestjs/graphql';
import { TransferOrderStatus } from '../../generated/prisma/enums';
import { StoreEntity } from '../../store/entities/store.entity';
import { TransferOrderProductEntity } from './transfer-order-product.entity';

@ObjectType()
export class TransferOrderEntity {
  @Field()
  id: string;

  @Field()
  fromStoreId: string;

  @Field(() => StoreEntity)
  fromStore: StoreEntity;

  @Field()
  toStoreId: string;

  @Field(() => StoreEntity)
  toStore: StoreEntity;

  @Field(() => TransferOrderStatus)
  status: TransferOrderStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [TransferOrderProductEntity])
  products: TransferOrderProductEntity[];
}