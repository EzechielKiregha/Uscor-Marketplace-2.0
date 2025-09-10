import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Subscription,
  Int,
  Float,
  InputType,
  Field,
} from '@nestjs/graphql'
import { FreelanceServiceService } from './freelance-service.service'
import {
  FreelanceServiceEntity,
  PaginatedFreelanceServicesResponse,
  WorkerServiceAssignmentEntity,
} from './entities/freelance-service.entity'
import {
  AssignWorkersInput,
  CreateFreelanceServiceInput,
  FreelanceServiceCategory,
} from './dto/create-freelance-service.input'
import { UpdateFreelanceServiceInput } from './dto/update-freelance-service.input'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UseGuards } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()

// Input for worker assignment
@InputType()
export class AssignWorkerToServiceInput {
  @Field()
  serviceId: string

  @Field()
  workerId: string

  @Field({ nullable: true })
  role?: string
}

// Resolver
@Resolver(() => FreelanceServiceEntity)
export class FreelanceServiceResolver {
  constructor(
    private readonly freelanceServiceService: FreelanceServiceService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceServiceEntity, {
    description:
      'Creates a new freelance service.',
  })
  async createFreelanceService(
    @Args('input')
    input: CreateFreelanceServiceInput,
    @Context() context,
  ) {
    const user = context.req.user
    const service =
      await this.freelanceServiceService.create(
        input,
        user.id,
      )

    // Publish subscription event
    pubSub.publish('freelanceServiceCreated', {
      freelanceServiceCreated: service,
      businessId: user.id,
    })

    return service
  }

  @Query(
    () => PaginatedFreelanceServicesResponse,
    {
      name: 'freelanceServices',
      description:
        'Retrieves freelance services with pagination and filters.',
    },
  )
  async freelanceServices(
    @Args('category', {
      type: () => String,
      nullable: true,
    })
    category?: string,
    @Args('minRate', {
      type: () => Float,
      nullable: true,
    })
    minRate?: number,
    @Args('maxRate', {
      type: () => Float,
      nullable: true,
    })
    maxRate?: number,
    @Args('isHourly', {
      type: () => Boolean,
      nullable: true,
    })
    isHourly?: boolean,
    @Args('businessId', {
      type: () => String,
      nullable: true,
    })
    businessId?: string,
    @Args('search', {
      type: () => String,
      nullable: true,
    })
    search?: string,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
    })
    page: number = 1,
    @Args('limit', {
      type: () => Int,
      defaultValue: 20,
    })
    limit: number = 20,
  ) {
    return this.freelanceServiceService.findAll({
      category,
      minRate,
      maxRate,
      isHourly,
      businessId,
      search,
      page,
      limit,
    })
  }

  @Query(() => FreelanceServiceEntity, {
    name: 'freelanceService',
    description:
      'Retrieves a single freelance service by ID.',
  })
  async freelanceService(
    @Args('id', { type: () => String })
    id: string,
  ) {
    return this.freelanceServiceService.findOne(
      id,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceServiceEntity, {
    description: 'Updates a freelance service.',
  })
  async updateFreelanceService(
    @Args('id', { type: () => String })
    id: string,
    @Args('input')
    input: UpdateFreelanceServiceInput,
    @Context() context,
  ) {
    const user = context.req.user
    const service =
      await this.freelanceServiceService.update(
        id,
        input,
        user.id,
      )

    // Publish subscription event
    pubSub.publish('freelanceServiceUpdated', {
      freelanceServiceUpdated: service,
      businessId: user.id,
    })

    return service
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => WorkerServiceAssignmentEntity, {
    description:
      'Assigns a worker to a freelance service.',
  })
  async assignWorkerToService(
    @Args('input')
    input: AssignWorkerToServiceInput,
    @Context() context,
  ) {
    const user = context.req.user
    return this.freelanceServiceService.assignWorkerToService(
      input,
      user.id,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceServiceEntity, {
    description: 'Deletes a freelance service.',
  })
  async deleteFreelanceService(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.freelanceServiceService.remove(
      id,
      user.id,
    )
  }

  @Query(() => [WorkerServiceAssignmentEntity], {
    name: 'workerServiceAssignments',
    description:
      'Get worker assignments for a service or worker.',
  })
  async workerServiceAssignments(
    @Args('workerId', { type: () => String })
    workerId: string,
    @Args('serviceId', {
      type: () => String,
      nullable: true,
    })
    serviceId?: string,
  ) {
    return this.freelanceServiceService.getWorkerAssignments(
      workerId,
      serviceId,
    )
  }

  // Subscriptions
  @Subscription(() => FreelanceServiceEntity, {
    filter: (payload, variables) => {
      return (
        payload.businessId ===
        variables.businessId
      )
    },
  })
  freelanceServiceCreated(
    @Args('businessId') businessId: string,
  ) {
    return pubSub.asyncIterableIterator(
      'freelanceServiceCreated',
    )
  }

  @Subscription(() => FreelanceServiceEntity, {
    filter: (payload, variables) => {
      return (
        payload.businessId ===
        variables.businessId
      )
    },
  })
  freelanceServiceUpdated(
    @Args('businessId') businessId: string,
  ) {
    return pubSub.asyncIterableIterator(
      'freelanceServiceUpdated',
    )
  }
}
