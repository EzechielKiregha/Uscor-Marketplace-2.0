import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { ClientService } from './client.service'
import { ClientEntity } from './entities/client.entity'
import {
  CreateClientInput,
  CreateClientForPOSInput,
} from './dto/create-client.input'
import { UpdateClientInput } from './dto/update-client.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { AddressInput } from './dto/address.input'
import { AddressEntity } from './entities/address.entity'
import { PaymentMethodInput } from './dto/payment-method.input'
import { PaymentMethodEntity } from './entities/payment-method.entity'
import { SuccessResponse } from '../common/dto/success.dto'
import { PromotionEntity } from './entities/promotion.entity'
import { RecommendationEntity } from './entities/recommendation.entity'
import { PaginatedReviews } from '../business/entities/paginated-reviews.entity'

@Resolver(() => ClientEntity)
export class ClientResolver {
  constructor(
    private readonly clientService: ClientService,
  ) {}

  @Mutation(() => ClientEntity, {
    description:
      'Creates a new client with hashed password.',
  })
  async createClient(
    @Args('createClientInput')
    createClientInput: CreateClientInput,
  ) {
    return this.clientService.create(
      createClientInput,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Mutation(() => ClientEntity, {
    description:
      'Creates a new client for POS with minimal info.',
  })
  async createClientForPOS(
    @Args('createClientInput')
    createClientInput: CreateClientForPOSInput,
  ) {
    return this.clientService.createForPOS(
      createClientInput,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business') // Allow clients to view their own data, businesses to view clients
  @Query(() => [ClientEntity], {
    name: 'clients',
    description:
      'Retrieves all clients with their relations.',
  })
  async getClients(@Context() context) {
    const user = context.req.user
    console.log('Authenticated user:', user) // Debugging
    return this.clientService.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business')
  @Query(() => ClientEntity, {
    name: 'client',
    description:
      'Retrieves a single client by ID.',
  })
  async getClient(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    if (
      user.role === 'client' &&
      user.id !== id
    ) {
      throw new Error(
        'Clients can only access their own data',
      )
    }
    return this.clientService.findOne(id)
  }

  // Computed fields for front-end
  @ResolveField('loyaltyPoints', () => Number)
  async loyaltyPoints(@Parent() client: ClientEntity) {
    if (!client.id) return 0
    return this.clientService.getLoyaltyPoints(client.id)
  }

  @ResolveField('loyaltyTier', () => String, { nullable: true })
  async loyaltyTier(@Parent() client: ClientEntity) {
    if (!client.id) return null
    return this.clientService.getLoyaltyTier(client.id)
  }

  @ResolveField('totalSpent', () => Number)
  async totalSpent(@Parent() client: ClientEntity) {
    if (!client.id) return 0
    return this.clientService.getTotalSpent(client.id)
  }

  @ResolveField('totalOrders', () => Number)
  async totalOrders(@Parent() client: ClientEntity) {
    if (!client.id) return 0
    return this.clientService.getTotalOrders(client.id)
  }

  // Address & payment mutations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => ClientEntity)
  async addClientAddress(
    @Args('clientId', { type: () => String }) clientId: string,
    @Args('input') input: AddressInput,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== clientId) throw new Error('Clients can only add addresses to their own profile')
    await this.clientService.addAddress(clientId, input)
    return this.clientService.findOne(clientId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => AddressEntity)
  async updateClientAddress(
    @Args('addressId', { type: () => String }) addressId: string,
    @Args('input') input: AddressInput,
    @Context() context,
  ) {
    // ensure owner
    const addr = await (this.clientService as any).prisma.address.findUnique({ where: { id: addressId } })
    const user = context.req.user
    if (!addr || addr.clientId !== user.id) throw new Error('Not authorized')
    return this.clientService.updateAddress(addressId, input)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => SuccessResponse)
  async deleteClientAddress(
    @Args('addressId', { type: () => String }) addressId: string,
    @Context() context,
  ) {
    const addr = await (this.clientService as any).prisma.address.findUnique({ where: { id: addressId } })
    const user = context.req.user
    if (!addr || addr.clientId !== user.id) throw new Error('Not authorized')
    await this.clientService.deleteAddress(addressId)
    return { success: true }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => ClientEntity)
  async addClientPaymentMethod(
    @Args('clientId', { type: () => String }) clientId: string,
    @Args('input') input: PaymentMethodInput,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== clientId) throw new Error('Clients can only add payment methods to their own profile')
    await this.clientService.addPaymentMethod(clientId, input)
    return this.clientService.findOne(clientId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => PaymentMethodEntity)
  async setDefaultPaymentMethod(
    @Args('paymentMethodId', { type: () => String }) paymentMethodId: string,
    @Context() context,
  ) {
    const pm = await (this.clientService as any).prisma.clientPaymentMethod.findUnique({ where: { id: paymentMethodId } })
    const user = context.req.user
    if (!pm || pm.clientId !== user.id) throw new Error('Not authorized')
    return this.clientService.setDefaultPaymentMethod(paymentMethodId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => ClientEntity, {
    name: 'clientByEmail',
    nullable: true,
    description: 'Find client by email.',
  })
  async getClientByEmail(
    @Args('email', { type: () => String })
    email: string,
  ) {
    return this.clientService.findByEmail(email)
  }

  @Query(() => PaginatedReviews, {
    name: 'clientReviews',
  })
  async getClientReviews(
    @Args('clientId', { type: () => String }) clientId: string,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    const skip = (page - 1) * limit
    const items = await (this.clientService as any).prisma.review.findMany({
      where: { clientId },
      include: {
        client: true,
        product: {
          select: {
            id: true,
            title: true,
            business: { select: { id: true, name: true, avatar: true } },
            medias: { select: { url: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })
    const total = await (this.clientService as any).prisma.review.count({ where: { clientId } })
    return { items, total, page, limit }
  }

  @Query(() => [PromotionEntity], { name: 'clientPromotions' })
  async getClientPromotions(
    @Args('clientId', { type: () => String }) clientId: string,
  ) {
    // Minimal implementation: return empty list for now
    return []
  }

  @Query(() => [RecommendationEntity], { name: 'clientRecommendations' })
  async getClientRecommendations(
    @Args('clientId', { type: () => String }) clientId: string,
  ) {
    // Simple logic: return latest products from businesses the client has ordered from
    const orders = await (this.clientService as any).prisma.order.findMany({ where: { clientId }, select: { id: true, businessId: true } })
    const businessIds = [...new Set(orders.map(o => o.businessId).filter(Boolean))]
    if (!businessIds.length) return []
    const items = await (this.clientService as any).prisma.product.findMany({ where: { businessId: { in: businessIds } }, take: 10, orderBy: { createdAt: 'desc' }, include: { medias: { select: { url: true } }, business: { select: { id: true, name: true } } } })
    const recs = items.map(it => ({ id: it.id, type: 'product', title: it.title, description: it.description, items: [{ id: it.id, name: it.title, price: it.price, mediaUrl: it.medias?.[0]?.url }], reason: 'Based on your orders', createdAt: it.createdAt }))
    return recs
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business', 'worker')
  @Query(() => [ClientEntity], {
    name: 'searchClients',
    description: 'Search clients by query.',
  })
  async searchClients(
    @Args('query', { type: () => String })
    query: string,
  ) {
    return this.clientService.searchClients(query)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => ClientEntity, {
    description: 'Updates a client’s details.',
  })
  async updateClient(
    @Args('id', { type: () => String })
    id: string,
    @Args('updateClientInput')
    updateClientInput: UpdateClientInput,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== id) {
      throw new Error(
        'Clients can only update their own data',
      )
    }
    return this.clientService.update(
      id,
      updateClientInput,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Mutation(() => ClientEntity, {
    description: 'Deletes a client.',
  })
  async deleteClient(
    @Args('id', { type: () => String })
    id: string,
    @Context() context,
  ) {
    const user = context.req.user
    if (user.id !== id) {
      throw new Error(
        'Clients can only delete their own account',
      )
    }
    return this.clientService.remove(id)
  }
}
