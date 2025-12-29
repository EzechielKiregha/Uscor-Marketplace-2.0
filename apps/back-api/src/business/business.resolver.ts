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
import { PaginatedBusinesses } from './entities/paginated-businesses.entity'
import { BusinessTypeEntity } from './entities/business-type.entity'
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
    const created = await this.businessService.create(
      createBusinessInput,
    )

    // publish businessAdded event for listing subscribers
    try {
      this.pubSub.publish('businessAdded', { businessAdded: created })
    } catch (e) {
      console.warn('Failed to publish businessAdded event', e)
    }

    return created
  }

  @Query(() => PaginatedBusinesses, {
    name: 'businesses',
    description: 'Retrieve businesses with pagination and filtering.',
  })
  async getBusinesses(
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('businessType', { type: () => String, nullable: true }) businessType?: string,
    @Args('hasLoyalty', { type: () => Boolean, nullable: true }) hasLoyalty?: boolean,
    @Args('hasPromotions', { type: () => Boolean, nullable: true }) hasPromotions?: boolean,
    @Args('isB2BEnabled', { type: () => Boolean, nullable: true }) isB2BEnabled?: boolean,
    @Args('isVerified', { type: () => Boolean, nullable: true }) isVerified?: boolean,
    @Args('sort', { type: () => String, nullable: true }) sort?: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.businessService.getBusinesses({ search, businessType, hasLoyalty, hasPromotions, isB2BEnabled, isVerified, sort, page, limit })
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

  // @Query(() => [ProductEntity], { name: 'businessProducts' })
  // async businessProducts(
  //   @Args('businessId', { type: () => String }) businessId: string,
  //   @Args('storeId', { type: () => String, nullable: true }) storeId?: string,
  //   @Args('category', { type: () => String, nullable: true }) category?: string,
  //   @Args('search', { type: () => String, nullable: true }) search?: string,
  //   @Args('page', { type: () => Int, nullable: true }) page?: number,
  //   @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  // ) {
  //   return this.businessService.getProducts({ businessId, storeId, category, search, page, limit })
  // }

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

  @Query(() => [BusinessTypeEntity], { name: 'businessTypes' })
  async businessTypes() {
    const types = await this.businessService.getBusinessTypes()
    return types.map((t: any) => ({ id: t.id, name: t.name, description: t.description, icon: t.icon }))
  }

  @Query(() => PaginatedReviews, { name: 'businessReviews' })
  async businessReviews(
    @Args('businessId', { type: () => String }) businessId: string,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return this.businessService.getReviews(businessId, page, limit)
  }

  // Subscription for business updates (filtered by businessId)
  @Subscription(() => BusinessEntity, {
    resolve: (payload) => payload.businessUpdated,
    filter: (payload, variables) => {
      return payload?.businessUpdated?.id === variables.businessId
    },
  })
  businessUpdated(@Args('businessId', { type: () => String }) businessId: string) {
    return this.pubSub.asyncIterableIterator('businessUpdated')
  }
  // Subscription for newly added businesses (no filter)
  @Subscription(() => BusinessEntity, {
    resolve: (payload) => payload.businessAdded,
  })
  businessAdded() {
    return this.pubSub.asyncIterableIterator('businessAdded')
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => BusinessEntity, {
    description: 'Updates a business’s details.',
  })
  async updateBusiness(
    @Args('id', { type: () => String })
    id: string,
    @Args('input', { type: () => UpdateBusinessInput })
    input: UpdateBusinessInput,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== id) {
      throw new Error(
        'Businesses can only update their own data',
      )
    }
    const updated = await this.businessService.update(
      id,
      input,
    )

    // Publish update event for subscribers
    try {
      this.pubSub.publish('businessUpdated', { businessUpdated: updated })
    } catch (e) {
      // non-fatal: log and continue returning updated entity
      console.warn('Failed to publish businessUpdated event', e)
    }

    return updated
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
