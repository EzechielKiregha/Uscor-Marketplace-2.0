import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { WorkerService } from './worker.service';
import { WorkerEntity } from './entities/worker.entity';
import { CreateWorkerInput } from './dto/create-worker.input';
import { UpdateWorkerInput } from './dto/update-worker.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver(() => WorkerEntity)
export class WorkerResolver {
  constructor(private readonly workerService: WorkerService) {}

  @Mutation(() => WorkerEntity, { description: 'Creates a new worker with hashed password.' })
  async createWorker(@Args('createWorkerInput') createWorkerInput: CreateWorkerInput) {
    return this.workerService.create(createWorkerInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker', 'business') // Allow workers to view their own data, businesses to view their workers
  @Query(() => [WorkerEntity], { name: 'workers', description: 'Retrieves all workers with their relations.' })
  async getWorkers(@Context() context) {
    const user = context.req.user;
    console.log('Authenticated user:', user); // Debugging
    return this.workerService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker', 'business')
  @Query(() => WorkerEntity, { name: 'worker', description: 'Retrieves a single worker by ID.' })
  async getWorker(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    if (user.role !== 'worker' && user.id !== id) {
      throw new Error('Workers can only access their own data');
    }
    return this.workerService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker')
  @Mutation(() => WorkerEntity, { description: 'Updates a worker’s details.' })
  async updateWorker(
    @Args('id', { type: () => String }) id: string,
    @Args('updateWorkerInput') updateWorkerInput: UpdateWorkerInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (user.id !== id) {
      throw new Error('Workers can only update their own data');
    }
    return this.workerService.update(id, updateWorkerInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker')
  @Mutation(() => WorkerEntity, { description: 'Deletes a worker.' })
  async deleteWorker(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    if (user.id !== id) {
      throw new Error('Workers can only delete their own account');
    }
    return this.workerService.remove(id);
  }
}
