import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
  ObjectType,
  Field,
} from '@nestjs/graphql'
import { StoreService } from './store.service'
import { StoreEntity } from './entities/store.entity'
import { CreateStoreInput } from './dto/create-store.input'
import { UpdateStoreInput } from './dto/update-store.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { WorkerService } from '../worker/worker.service'
import { StoreStatistics } from './entities/store-stats.entity'

// Resolver
@Resolver(() => StoreEntity)
export class StoreResolver {
  constructor(
    private readonly storeService: StoreService,
    private readonly workerService: WorkerService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => StoreEntity, {
    description:
      'Creates a new store for a business.',
  })
  async createStore(
    @Args('createStoreInput')
    createStoreInput: CreateStoreInput,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== createStoreInput.businessId) {
      throw new Error(
        'Businesses can only create stores for themselves',
      )
    }
    return this.storeService.create(
      createStoreInput,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => StoreEntity, {
    description: 'Updates an existing store.',
  })
  async updateStore(
    @Args('id', { type: () => String })
    id: string,
    @Args('updateStoreInput')
    updateStoreInput: UpdateStoreInput,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.role === 'business') {
      return this.storeService.update(
        id,
        updateStoreInput,
        user.id,
      )
    }
    if (user.role === 'worker') {
      const worker =
        await this.workerService.findOne(user.id)

      if (!worker)
        throw new Error('Worker not found')

      return this.storeService.update(
        id,
        updateStoreInput,
        worker.businessId,
      )
    }
    throw new Error('Unauthorized')
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => StoreEntity, {
    description: 'Deletes a store.',
  })
  async deleteStore(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.remove(id, user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [StoreEntity], {
    name: 'stores',
    description:
      'Retrieves stores for a business.',
  })
  async getStores(@Context() context) {
    const user = context.req.user
    if (user.role === 'business') {
      return this.storeService.findAll(user.id)
    }
    if (user.role === 'worker') {
      const worker =
        await this.workerService.findOne(user.id)

      if (!worker)
        throw new Error('Worker not found')

      return this.storeService.findAll(
        worker.businessId,
      )
    }
    throw new Error('Unauthorized')
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => StoreEntity, {
    name: 'store',
    description:
      'Retrieves a single store by ID.',
  })
  async getStore(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.verifyStoreAccess(
      id,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => StoreStatistics, {
    name: 'storeStatistics',
    description:
      'Retrieves statistics for a store.',
  })
  async getStoreStatistics(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.role === 'business') {
      return this.storeService.getStoreStatistics(
        storeId,
        user.id,
      )
    }
    if (user.role === 'worker') {
      const worker =
        await this.workerService.findOne(user.id)
      if (!worker)
        throw new Error('Worker not found')
      return this.storeService.getStoreStatistics(
        storeId,
        worker.businessId,
      )
    }
    throw new Error('Unauthorized')
  }
}
