import { UseGuards } from "@nestjs/common";
import {
    Args,
    Context,
    Mutation,
    Query,
    Resolver,
    Subscription,
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { ProductEntity } from "src/product/entities/product.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ShiftStatus } from "../generated/prisma/enums";
import { CreateWorkerInput } from "../worker/dto";
import { ShiftEntityWorker } from "../worker/entities/shift.entity";
import { WorkerEntity } from "../worker/entities/worker.entity";
import { WorkerService } from "../worker/worker.service";
import { AddWorkerToStoreInput } from "./dto/add-worker-to-store.input";
import { CreateStoreInput } from "./dto/create-store.input";
import { GenerateStoreReportInput } from "./dto/report.dto";
import { UpdateStoreInput } from "./dto/update-store.input";
import {
    ReportHistoryEntity,
    StoreReportResponse,
} from "./entities/report.entity";
import { StoreDashboardStatsEntity } from "./entities/store-dashboard-stats.entity";
import { StoreInventoryEntity } from "./entities/store-inventory.entity";
import { StoreReportEntity } from "./entities/store-report.entity";
import { StoreSuccessResponse } from "./entities/store-response.entity";
import { StoreStatistics } from "./entities/store-stats.entity";
import { StoreEntity } from "./entities/store.entity";
import { StoreService } from "./store.service";

const pubSub = new PubSub();

@Resolver(() => StoreEntity)
export class StoreResolver {
  constructor(
    private readonly storeService: StoreService,
    private readonly workerService: WorkerService,
  ) {}

  // ── Mutations ──────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => StoreEntity, {
    description:
      'Creates a new store for a business.',
  })
  async createStore(
    @Args('input')
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
    @Args('input')
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
  @Mutation(() => WorkerEntity, {
    description: 'Adds a worker to a store.',
  })
  async addWorkerToStore(
    @Args('input') input: AddWorkerToStoreInput,
    @Context() context,
    @Args('inputWorker', {
      type: () => CreateWorkerInput,
      nullable: true,
    })
    inputWorker?: CreateWorkerInput,
  ) {
    const user = context.req.user
    let worker

    // console.log("Request Data: ", { input, inputWorker });

    if (input.createNewWorker && inputWorker) {
      const existingWorker =
        await this.workerService.findOneByEmain(
          inputWorker.email,
        )
      if (existingWorker !== null) {
        worker =
          await this.storeService.addWorkerToStore(
            {
              storeId: input.storeId,
              email: existingWorker.email,
            },
            user,
          )
      } else {
        // create worker first
        const newWorker =
          await this.workerService.create(
            inputWorker,
          )
        // console.log({ newWorker });
        if (!newWorker) {
          throw new Error(
            'Failed to create New Worker and add him to store',
          )
        }
        worker =
          await this.workerService.findOneByEmain(
            newWorker.email,
          )
      }
    } else {
      // attach existing worker
      worker =
        await this.storeService.addWorkerToStore(
          input,
          user,
        )
    }
    pubSub.publish('workerAddedToStore', {
      workerAddedToStore: worker,
      storeId: input.storeId,
    })
    return worker
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => StoreSuccessResponse, {
    description: 'Removes a worker from a store.',
  })
  async removeWorkerFromStore(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Args('workerId', { type: () => String })
    workerId: string,
    @Context() context,
  ) {
    const user = context.req.user
    const result =
      await this.storeService.removeWorkerFromStore(
        storeId,
        workerId,
        user,
      )
    pubSub.publish('workerRemovedFromStore', {
      workerRemovedFromStore: result,
      storeId,
    })
    return result
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [StoreEntity], {
    name: 'stores',
    description:
      'Retrieves stores for a business.',
  })
  async getStores(@Context() context) {
    const user = context.req.user
    if (user.role === 'business')
      return this.storeService.findAll(user.id)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => StoreDashboardStatsEntity, {
    name: 'storeDashboardStats',
  })
  async getStoreDashboardStats(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.getStoreDashboardStats(
      storeId,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [WorkerEntity], {
    name: 'storeWorkers',
  })
  async getStoreWorkers(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.getStoreWorkers(
      storeId,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => StoreReportEntity, {
    name: 'storeReports',
  })
  async getStoreReports(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Args('period', {
      type: () => String,
      defaultValue: 'week',
    })
    period: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.getStoreReports(
      storeId,
      period,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [ShiftEntityWorker], {
    name: 'storeShifts',
  })
  async getStoreShifts(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Args('status', {
      type: () => ShiftStatus,
      nullable: true,
    })
    status: ShiftStatus,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.getStoreShifts(
      storeId,
      status,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => StoreInventoryEntity, {
    name: 'storeInventory',
  })
  async getStoreInventory(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.getStoreInventory(
      storeId,
      user,
    )
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [ProductEntity], {
    name: 'storeProducts',
  })
  async getStoreProductsForCache(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.getStoreProducts(
      storeId,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => StoreReportResponse, {
    description:
      'Generates and uploads a PDF report',
  })
  async generateStoreReport(
    @Args('input')
    input: GenerateStoreReportInput,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.generateStoreReport(
      input,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [ReportHistoryEntity], {
    name: 'reportHistory',
  })
  async getReportHistory(
    @Args('storeId') storeId: string,
    @Context() context,
  ) {
    const user = context.req.user
    return this.storeService.getReportHistory(
      storeId,
      user,
    )
  }

  // ── Subscriptions ──────────────────────────────────────────────────────────

  @Subscription(() => WorkerEntity, {
    filter: (payload, variables) =>
      payload.storeId === variables.storeId,
  })
  workerAddedToStore(
    @Args('storeId', { type: () => String })
    storeId: string,
  ) {
    return pubSub.asyncIterableIterator(
      'workerAddedToStore',
    )
  }

  @Subscription(() => StoreSuccessResponse, {
    filter: (payload, variables) =>
      payload.storeId === variables.storeId,
  })
  workerRemovedFromStore(
    @Args('storeId', { type: () => String })
    storeId: string,
  ) {
    return pubSub.asyncIterableIterator(
      'workerRemovedFromStore',
    )
  }
}
