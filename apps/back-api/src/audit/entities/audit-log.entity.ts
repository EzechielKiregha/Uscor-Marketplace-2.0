import { ObjectType, Field, Int } from '@nestjs/graphql'
import { WorkerEntity } from '../../worker/entities/worker.entity'

@ObjectType()
export class AuditLogEntity {
  @Field() id: string
  @Field() action: string
  @Field() entityType: string
  @Field() entityId: string
  @Field(() => String, { nullable: true }) details?: any
  @Field() createdAt: Date
  @Field({ nullable: true }) adminId?: string
  @Field(() => WorkerEntity, { nullable: true }) admin?: WorkerEntity
}

@ObjectType()
export class PaginatedAuditLogsResponse {
  @Field(() => [AuditLogEntity]) items: AuditLogEntity[]
  @Field(() => Int) total: number
  @Field(() => Int) page: number
  @Field(() => Int) limit: number
}
