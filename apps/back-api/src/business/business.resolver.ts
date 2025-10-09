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
import { ProductEntity } from '../product/entities/product.entity'
import { PaginatedReviews } from './entities/paginated-reviews.entity'
import { Subscription } from '@nestjs/graphql'
import { FreelanceServiceEntity } from '../freelance-service/entities/freelance-service.entity'
import { CreateBusinessInput } from './dto/create-business.input'
import { UpdateBusinessInput } from './dto/update-business.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { BusinessDashboardResponse } from './entities/business-dashboard.entity'
import { Inject } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'

@Resolver(() => BusinessEntity)
export class BusinessResolver {
  constructor(
    private readonly businessService: BusinessService,
    @Inject('PUB_SUB') private pubSub: PubSub,
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

  @Query(() => [ProductEntity], { name: 'businessProducts' })
  async businessProducts(
    @Args('businessId', { type: () => String }) businessId: string,
    @Args('storeId', { type: () => String, nullable: true }) storeId?: string,
    @Args('category', { type: () => String, nullable: true }) category?: string,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.businessService.getProducts({ businessId, storeId, category, search, page, limit })
  }

  @Query(() => [FreelanceServiceEntity], { name: 'businessServices' })
  async businessServices(
    @Args('businessId', { type: () => String }) businessId: string,
    @Args('category', { type: () => String, nullable: true }) category?: string,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.businessService.getServices({ businessId, category, search, page, limit })
  }

  @Query(() => BusinessDashboardResponse, { name: 'businessDashboard' })
  async businessDashboard(@Context() context) {
    const user = context.req.user
    return this.getBusinessDashboard(context)
  }

  @Query(() => PaginatedReviews, { name: 'businessReviews' })
  async businessReviews(
    @Args('businessId', { type: () => String }) businessId: string,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return this.businessService.getReviews(businessId, page, limit)
  }

  // Subscription for business updates
  @Subscription(() => BusinessEntity, {
    resolve: (payload) => payload.businessUpdated,
  })
  businessUpdated(payload: any, args: any) {
    // payload will be { businessUpdated: Business }
    if (!args || !args.businessId) return null
    if (payload?.businessUpdated?.id !== args.businessId) return null
    return this.pubSub.asyncIterableIterator('businessUpdated')
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
