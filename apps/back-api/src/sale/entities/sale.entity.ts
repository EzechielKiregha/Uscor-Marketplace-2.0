import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { WorkerEntity } from '../../worker/entities/worker.entity';
import { ClientEntity } from '../../client/entities/client.entity';
import { PaymentMethod } from '../../payment-transaction/dto/create-payment-transaction.input';
import { SaleStatus } from '../../generated/prisma/enums';
import { SaleProductEntity } from './sale-product.entity';
import { ReturnEntity } from './return.entity';
import { StoreEntity } from '../../store/entities/store.entity';

// Enums
registerEnumType(SaleStatus, { name: 'SaleStatus' });

@ObjectType()
export class SaleEntity {
  @Field()
  id: string;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field()
  workerId: string;

  @Field(() => WorkerEntity)
  worker: WorkerEntity;

  @Field({ nullable: true })
  clientId?: string;

  @Field(() => ClientEntity, { nullable: true })
  client?: ClientEntity;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  discount: number;

  @Field(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => SaleStatus)
  status: SaleStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [SaleProductEntity])
  saleProducts: SaleProductEntity[];

  @Field(() => [ReturnEntity])
  returns: ReturnEntity[];
}


