import { ObjectType, Field, Int } from '@nestjs/graphql'
import { BusinessEntity } from '../../business/entities/business.entity'
import { OrderEntity } from '../../order/entities/order.entity'
import { ClientEntity } from '../../client/entities/client.entity'
import { WorkerEntity } from '../../worker/entities/worker.entity'

@ObjectType()
export class DisputeMessageEntity {
  @Field() id: string
  @Field() content: string
  @Field() createdAt: Date
  @Field(() => String, { nullable: true }) senderId?: string
  @Field(() => ClientEntity || BusinessEntity || WorkerEntity, { nullable: true }) sender?: ClientEntity | BusinessEntity | WorkerEntity
}

@ObjectType()
export class DisputeEntity {
  @Field() id: string
  @Field() title: string
  @Field({ nullable: true }) description?: string
  @Field() status: string
  @Field({ nullable: true }) type?: string
  @Field() createdAt: Date
  @Field({ nullable: true }) resolvedAt?: Date
  @Field({ nullable: true }) resolutionNotes?: string
  @Field({ nullable: true }) reporterId?: string
  @Field({ nullable: true }) reporterType?: string
  @Field(() => ClientEntity || BusinessEntity || WorkerEntity, { nullable: true }) reporter?: ClientEntity | BusinessEntity | WorkerEntity
  @Field({ nullable: true }) businessId?: string
  @Field(() => BusinessEntity, { nullable: true }) business?: BusinessEntity
  @Field({ nullable: true }) orderId?: string
  @Field(() => OrderEntity, { nullable: true }) order?: OrderEntity
  @Field(() => [DisputeMessageEntity], { nullable: true }) messages?: DisputeMessageEntity[]
}

@ObjectType()
export class PaginatedDisputesResponse {
  @Field(() => [DisputeEntity]) items: DisputeEntity[]
  @Field(() => Int) total: number
  @Field(() => Int) page: number
  @Field(() => Int) limit: number
}
