import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { StoreEntity } from '../../store/entities/store.entity';
import { WorkerEntity } from '../../worker/entities/worker.entity';

@ObjectType()
export class ShiftEntity {
  @Field()
  id: string;

  @Field()
  workerId: string;

  @Field(() => WorkerEntity)
  worker: WorkerEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field()
  startTime: Date;

  @Field({ nullable: true })
  endTime?: Date;

  @Field(() => Float)
  sales: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}