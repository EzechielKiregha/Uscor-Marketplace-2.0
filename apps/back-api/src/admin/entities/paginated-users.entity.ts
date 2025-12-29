import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Admin } from './admin.entity';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ClientEntity } from '../../client/entities/client.entity';
import { WorkerEntity } from '../../worker/entities/worker.entity';

@ObjectType()
export class PaginatedBusinessesResponse {
  @Field(() => [BusinessEntity], { nullable: true })
  items?: BusinessEntity[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class PaginatedClientsResponse {

  @Field(() => [ClientEntity], { nullable: true })
  items?: ClientEntity[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class PaginatedWorkersResponse {

  @Field(() => [WorkerEntity], { nullable: true })
  items?: WorkerEntity[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class PaginatedAdminsResponse {

  @Field(() => [Admin], { nullable: true })
  items?: Admin[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}