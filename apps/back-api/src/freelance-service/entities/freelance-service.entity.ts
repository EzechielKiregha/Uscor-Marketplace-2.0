import {
  ObjectType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql'
import { IsEnum } from 'class-validator'
import { BusinessEntity } from '../../business/entities/business.entity'
import { WorkerEntity } from '../../worker/entities/worker.entity'
import { FreelanceServiceCategory } from '../dto/create-freelance-service.input'

@ObjectType()
export class FreelanceServiceEntity {
  @Field()
  id: string

  @Field()
  title: string

  @Field({ nullable: true })
  description?: string

  @Field(() => Boolean)
  isHourly: boolean

  @Field(() => Float)
  rate: number

  @Field(() => FreelanceServiceCategory)
  @IsEnum(FreelanceServiceCategory)
  category: FreelanceServiceCategory

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field(() => BusinessEntity)
  business: BusinessEntity

  @Field(() => [WorkerServiceAssignmentEntity])
  workerServiceAssignments: WorkerServiceAssignmentEntity[]
}

@ObjectType()
export class WorkerServiceAssignmentEntity {
  @Field()
  id: string

  @Field()
  serviceId: string

  @Field()
  workerId: string

  @Field(() => WorkerEntity)
  worker: WorkerEntity

  @Field({ nullable: true })
  role?: string

  @Field()
  assignedAt: Date
}

@ObjectType()
export class PaginatedFreelanceServicesResponse {
  @Field(() => [FreelanceServiceEntity])
  items: FreelanceServiceEntity[]

  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number
}
