import { Resolver, Query, Mutation, Args, Int, Float, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductEntity } from '../product/entities/product.entity';
import { FreelanceServiceEntity, PaginatedFreelanceServicesResponse } from '../freelance-service/entities/freelance-service.entity';
import { ProductService } from '../product/product.service';
import { FreelanceServiceService } from '../freelance-service/freelance-service.service';
import { PaginatedProductsResponse } from './dto/paginated-products.response';
import { SearchMarketplaceResponse } from './dto/search-marketplace.response';
import { PubSub } from 'graphql-subscriptions';
import { BusinessTypeEntity } from '../business/entities/business-type.entity'
import { CategoryEntity } from '../category/entities/category.entity'

@Resolver()
export class MarketplaceResolver {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly productService: ProductService,
    private readonly freelanceServiceService: FreelanceServiceService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => PaginatedProductsResponse, { name: 'marketplaceProducts' })
  async marketplaceProducts(
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('category', { type: () => String, nullable: true }) category?: string,
    @Args('businessType', { type: () => String, nullable: true }) businessType?: string,
    @Args('hasPromotion', { type: () => Boolean, nullable: true }) hasPromotion?: boolean,
    @Args('isFeatured', { type: () => Boolean, nullable: true }) isFeatured?: boolean,
    @Args('minPrice', { type: () => Float, nullable: true }) minPrice?: number,
    @Args('maxPrice', { type: () => Float, nullable: true }) maxPrice?: number,
    @Args('sort', { type: () => String, nullable: true }) sort?: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('limit', { type: () => Int, defaultValue: 12 }) limit = 12,
  ) {
    const skip = (page - 1) * limit
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = { OR: [{ id: category }, { name: category }] }
    }

    if (businessType) {
      where.business = { businessType }
    }

    if (isFeatured !== undefined) {
      where.featured = isFeatured
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice }
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice }
    }

    const orderBy: any = sort === 'asc' ? { createdAt: 'asc' } : { createdAt: 'desc' }

    // If no filters/arguments were provided (treat default false and 'relevance' as no-filter), return all products (no pagination)
    const isDefaultFetch = !search && !category && !businessType && hasPromotion !== true && isFeatured !== true && minPrice === undefined && maxPrice === undefined && (sort === undefined || sort === 'relevance')

    if (isDefaultFetch) {
      // fetch ALL matching products (no skip/take)
      const itemsAll = await this.prisma.product.findMany({
        where,
        include: {
          medias: { select: { url: true, type: true } },
          business: { select: { id: true, name: true, avatar: true, businessType: true, kycStatus: true } },
          store: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy,
      })

      // Attach promotions across full set
      const businessIdsAll = Array.from(new Set(itemsAll.map((p: any) => p.businessId))).filter(Boolean)
      const categoryNamesAll = Array.from(new Set(itemsAll.map((p: any) => p.category?.name).filter(Boolean)))

      const nowAll = new Date()
      const promoWhereClausesAll: any[] = []
      if (businessIdsAll.length) promoWhereClausesAll.push({ applicableBusinesses: { some: { id: { in: businessIdsAll } } } })
      if (categoryNamesAll.length) promoWhereClausesAll.push({ applicableCategories: { hasSome: categoryNamesAll } })

      let promotionsAll: any[] = []
      if (promoWhereClausesAll.length) {
        promotionsAll = await this.prisma.promotion.findMany({
          where: {
            AND: [
              { OR: promoWhereClausesAll },
              { OR: [{ startDate: null }, { startDate: { lte: nowAll } }] },
              { OR: [{ endDate: null }, { endDate: { gte: nowAll } }] },
            ],
          },
          include: { applicableBusinesses: { select: { id: true } } },
        })
      }

      const mappedAll = itemsAll.map((p: any) => ({
        ...p,
        promotions: promotionsAll.filter((pr) => {
          const byBusiness = pr.applicableBusinesses?.some((b: any) => b.id === p.businessId)
          const byCategory = p.category?.name ? pr.applicableCategories?.includes(p.category.name) : false
          return byBusiness || byCategory
        }),
      }))

      return { items: mappedAll, total: mappedAll.length, page: 1, limit: mappedAll.length }
    }

    // If caller asked for only promoted items, we must compute promoted IDs across the full match set
    if (hasPromotion) {
      // fetch minimal data for all matching products so we can evaluate promotion applicability
      const allMatches = await this.prisma.product.findMany({
        where,
        select: { id: true, businessId: true, category: { select: { name: true } } },
      })

      const businessIdsAll = Array.from(new Set(allMatches.map((p: any) => p.businessId))).filter(Boolean)
      const categoryNamesAll = Array.from(new Set(allMatches.map((p: any) => p.category?.name).filter(Boolean)))

      const now = new Date()
      const promoWhereClauses: any[] = []
      if (businessIdsAll.length) promoWhereClauses.push({ applicableBusinesses: { some: { id: { in: businessIdsAll } } } })
      if (categoryNamesAll.length) promoWhereClauses.push({ applicableCategories: { hasSome: categoryNamesAll } })

      let promotions: any[] = []
      if (promoWhereClauses.length) {
        promotions = await this.prisma.promotion.findMany({
          where: {
            AND: [
              { OR: promoWhereClauses },
              { OR: [{ startDate: null }, { startDate: { lte: now } }] },
              { OR: [{ endDate: null }, { endDate: { gte: now } }] },
            ],
          },
          include: { applicableBusinesses: { select: { id: true } } },
        })
      }

      const promotedIds = allMatches.filter((p: any) => {
        const applicable = promotions.filter((pr) => {
          const byBusiness = pr.applicableBusinesses?.some((b: any) => b.id === p.businessId)
          const byCategory = p.category?.name ? pr.applicableCategories?.includes(p.category.name) : false
          return byBusiness || byCategory
        })
        return applicable.length > 0
      }).map((p: any) => p.id)

      // If none are promoted, return empty page
      if (promotedIds.length === 0) {
        return { items: [], total: 0, page, limit }
      }

      // Query paginated items restricted to promoted ids
      const [items] = await Promise.all([
        this.prisma.product.findMany({
          where: { id: { in: promotedIds } },
          skip,
          take: limit,
          include: {
            medias: { select: { url: true, type: true } },
            business: { select: { id: true, name: true, avatar: true, businessType: true, kycStatus: true } },
            store: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
          orderBy,
        }),
      ])

      const mappedItems = items.map((p: any) => ({
        ...p,
        promotions: promotions.filter((pr) => {
          const byBusiness = pr.applicableBusinesses?.some((b: any) => b.id === p.businessId)
          const byCategory = p.category?.name ? pr.applicableCategories?.includes(p.category.name) : false
          return byBusiness || byCategory
        }),
      }))

      return { items: mappedItems, total: promotedIds.length, page, limit }
    }

    // Default non-promotion path: fetch paginated items and DB total
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          medias: { select: { url: true, type: true } },
          business: { select: { id: true, name: true, avatar: true, businessType: true, kycStatus: true } },
          store: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ])

    // Attach promotions if any (only for the current page items)
    const businessIds = Array.from(new Set(items.map((p: any) => p.businessId))).filter(Boolean)
    const categoryNames = Array.from(new Set(items.map((p: any) => p.category?.name).filter(Boolean)))

    const now = new Date()
    const promoWhereClauses: any[] = []
    if (businessIds.length) promoWhereClauses.push({ applicableBusinesses: { some: { id: { in: businessIds } } } })
    if (categoryNames.length) promoWhereClauses.push({ applicableCategories: { hasSome: categoryNames } })

    let promotions: any[] = []
    if (promoWhereClauses.length) {
      promotions = await this.prisma.promotion.findMany({
        where: {
          AND: [
            { OR: promoWhereClauses },
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        include: { applicableBusinesses: { select: { id: true } } },
      })
    }

    const mappedItems = items.map((p: any) => ({
      ...p,
      promotions: promotions.filter((pr) => {
        const byBusiness = pr.applicableBusinesses?.some((b: any) => b.id === p.businessId)
        const byCategory = p.category?.name ? pr.applicableCategories?.includes(p.category.name) : false
        return byBusiness || byCategory
      }),
    }))

    return { items: mappedItems, total, page, limit }
  }

  @Query(() => PaginatedFreelanceServicesResponse, { name: 'marketplaceServices' })
  async marketplaceServices(
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('category', { type: () => String, nullable: true }) category?: string,
    @Args('businessType', { type: () => String, nullable: true }) businessType?: string,
    @Args('minPrice', { type: () => Float, nullable: true }) minPrice?: number,
    @Args('maxPrice', { type: () => Float, nullable: true }) maxPrice?: number,
    @Args('sort', { type: () => String, nullable: true }) sort?: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('limit', { type: () => Int, defaultValue: 12 }) limit = 12,
  ) {
    if (businessType) {
      const skip = (page - 1) * limit
      const where: any = {}
      if (category) where.category = category
      if (minPrice !== undefined) where.rate = { ...where.rate, gte: minPrice }
      if (maxPrice !== undefined) where.rate = { ...where.rate, lte: maxPrice }
      if (search) where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]

      const [items, total] = await Promise.all([
        this.prisma.freelanceService.findMany({
          where: { ...where, business: { businessType } },
          skip,
          take: limit,
          include: {
            business: { select: { id: true, name: true, avatar: true, businessType: true, kycStatus: true } },
            workerServiceAssignments: { include: { worker: { select: { id: true, fullName: true, avatar: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.freelanceService.count({ where: { ...where, business: { businessType } } }),
      ])

      return { items, total, page, limit }
    }

    return await this.freelanceServiceService.findAll({
      category,
      minRate: minPrice,
      maxRate: maxPrice,
      search,
      page,
      limit,
    })
  }

  @Query(() => [BusinessTypeEntity], { name: 'businessTypes' })
  async businessTypes() {
    return this.prisma.businessType.findMany()
  }

  @Query(() => [CategoryEntity], { name: 'productCategories' })
  async productCategories() {
    return this.prisma.category.findMany()
  }

  @Query(() => SearchMarketplaceResponse)
  async searchMarketplace(@Args('query') query: string) {
    const [products, services] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          medias: { select: { url: true, type: true } },
          business: { select: { id: true, name: true, avatar: true, businessType: true, kycStatus: true } },
          store: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      this.freelanceServiceService.findAll({ search: query, page: 1, limit: 50 }),
    ])

    // attach promotions to products
    const businessIds = Array.from(new Set(products.map((p: any) => p.businessId))).filter(Boolean)
    const categoryNames = Array.from(new Set(products.map((p: any) => p.category?.name).filter(Boolean)))
    const now = new Date()
    const promoWhereClauses: any[] = []
    if (businessIds.length) promoWhereClauses.push({ applicableBusinesses: { some: { id: { in: businessIds } } } })
    if (categoryNames.length) promoWhereClauses.push({ applicableCategories: { hasSome: categoryNames } })
    let promotions: any[] = []
    if (promoWhereClauses.length) {
      promotions = await this.prisma.promotion.findMany({
        where: {
          AND: [
            { OR: promoWhereClauses },
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        include: { applicableBusinesses: { select: { id: true } } },
      })
    }

    const mappedProducts = products.map((p: any) => ({
      ...p,
      promotions: promotions.filter((pr) => {
        const byBusiness = pr.applicableBusinesses?.some((b: any) => b.id === p.businessId)
        const byCategory = p.category?.name ? pr.applicableCategories?.includes(p.category.name) : false
        return byBusiness || byCategory
      }),
    }))

    return { products: mappedProducts, services: services.items }
  }

  @Subscription(() => ProductEntity, {
    filter: (payload, variables) => payload.businessId === variables.businessId,
    resolve: (payload) => payload.productCreated,
  })
  productAdded(@Args('businessId') businessId: string) {
    return this.pubSub.asyncIterableIterator('productCreated')
  }

  @Subscription(() => FreelanceServiceEntity, {
    filter: (payload, variables) => payload.businessId === variables.businessId,
    resolve: (payload) => payload.freelanceServiceCreated,
  })
  serviceAdded(@Args('businessId') businessId: string) {
    return this.pubSub.asyncIterableIterator('freelanceServiceCreated')
  }
}
