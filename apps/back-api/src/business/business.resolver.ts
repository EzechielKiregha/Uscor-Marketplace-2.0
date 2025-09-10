import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
} from '@nestjs/graphql'
import { BusinessService } from './business.service'
import { BusinessEntity } from './entities/business.entity'
import { CreateBusinessInput } from './dto/create-business.input'
import { UpdateBusinessInput } from './dto/update-business.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { BusinessDashboardResponse } from './entities/business-dashboard.entity'

@Resolver(() => BusinessEntity)
export class BusinessResolver {
  constructor(
    private readonly businessService: BusinessService,
  ) {}

  @Mutation(() => BusinessEntity, {
    description:
      'Creates a new business with hashed password.',
  })
  async createBusiness(
    @Args('createBusinessInput')
    createBusinessInput: CreateBusinessInput,
  ) {
    return this.businessService.create(
      createBusinessInput,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client') // Allow businesses to view their own data, clients to view businesses
  @Query(() => [BusinessEntity], {
    name: 'businesses',
    description:
      'Retrieves all businesses with their relations.',
  })
  async getBusinesses(@Context() context) {
    const user = context.req.user
    console.log('Authenticated user:', user) // Debugging
    return this.businessService.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'client')
  @Query(() => BusinessEntity, {
    name: 'business',
    description:
      'Retrieves a single business by ID.',
  })
  async getBusiness(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    if (
      user.role === 'business' &&
      user.id !== id
    ) {
      throw new Error(
        'Businesses can only access their own data',
      )
    }
    return this.businessService.findOne(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => BusinessEntity, {
    description: 'Updates a business’s details.',
  })
  async updateBusiness(
    @Args('id', { type: () => String })
    id: string,
    @Args('updateBusinessInput')
    updateBusinessInput: UpdateBusinessInput,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== id) {
      throw new Error(
        'Businesses can only update their own data',
      )
    }
    return this.businessService.update(
      id,
      updateBusinessInput,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => BusinessEntity, {
    description: 'Deletes a business.',
  })
  async deleteBusiness(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== id) {
      throw new Error(
        'Businesses can only delete their own account',
      )
    }
    return this.businessService.remove(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => BusinessDashboardResponse, {
    name: 'businessDashboard',
  })
  async getBusinessDashboard(@Context() context) {
    const user = context.req.user
    if (user.role !== 'business') {
      throw new Error(
        'Unauthorized access to business dashboard',
      )
    }
    return this.businessService.getBusinessDashboard(
      user.id,
    )
  }
}
