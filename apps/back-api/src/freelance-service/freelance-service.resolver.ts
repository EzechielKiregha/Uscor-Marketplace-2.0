import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { FreelanceServiceService } from './freelance-service.service';
import { FreelanceServiceEntity } from './entities/freelance-service.entity';
import { AssignWorkersInput, CreateFreelanceServiceInput } from './dto/create-freelance-service.input';
import { UpdateFreelanceServiceInput } from './dto/update-freelance-service.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { FreelanceCategory } from './freelance-service.module';

// Resolver
@Resolver(() => FreelanceServiceEntity)
export class FreelanceServiceResolver {
  constructor(private readonly freelanceServiceService: FreelanceServiceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceServiceEntity, { description: 'Creates a new freelance service.' })
  async createFreelanceService(
    @Args('createFreelanceServiceInput') createFreelanceServiceInput: CreateFreelanceServiceInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.freelanceServiceService.create(createFreelanceServiceInput, user.id);
  }

  @Query(() => [FreelanceServiceEntity], { name: 'freelanceServices', description: 'Retrieves freelance services, optionally filtered by category.' })
  async getFreelanceServices(
    @Args('category', { type: () => FreelanceCategory, nullable: true }) category?: FreelanceCategory,
  ) {
    return this.freelanceServiceService.findAll(category);
  }

  @Query(() => FreelanceServiceEntity, { name: 'freelanceService', description: 'Retrieves a single freelance service by ID.' })
  async getFreelanceService(@Args('id', { type: () => String }) id: string) {
    return this.freelanceServiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceServiceEntity, { description: 'Updates a freelance service.' })
  async updateFreelanceService(
    @Args('id', { type: () => String }) id: string,
    @Args('updateFreelanceServiceInput') updateFreelanceServiceInput: UpdateFreelanceServiceInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.freelanceServiceService.update(id, updateFreelanceServiceInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceServiceEntity, { description: 'Assigns workers to a freelance service.' })
  async assignWorkersToService(
    @Args('assignWorkersInput') assignWorkersInput: AssignWorkersInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.freelanceServiceService.assignWorkers(assignWorkersInput, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => FreelanceServiceEntity, { description: 'Deletes a freelance service.' })
  async deleteFreelanceService(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.freelanceServiceService.remove(id, user.id);
  }
}