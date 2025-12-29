import { Resolver, Query, Mutation, Args, Subscription, Int } from '@nestjs/graphql'
import { Inject, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { CreateAdminInput } from './dto/create-admin.input'
import { UpdateAdminInput } from './dto/update-admin.input'
import { PubSub } from 'graphql-subscriptions'
import { Admin } from './entities/admin.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { ClientEntity } from '../client/entities/client.entity'
import { PaginatedAdminsResponse, PaginatedBusinessesResponse, PaginatedClientsResponse, PaginatedWorkersResponse } from './entities/paginated-users.entity'
import { BusinessEntity } from '../business/entities/business.entity'
import { WorkerEntity } from '../worker/entities/worker.entity'
import { UserService } from './user.service'
import { GetUsersInput } from './dto/get-users.input'
import { UpdateUserStatusInput } from './dto/update-user-status.input'
import { RejectKycInput } from './dto/reject-kyc.input'
import { VerifyKycInput } from './dto/verify-kyc.input'

@Resolver()
export class AdminResolver {
  constructor(
    private adminService: AdminService,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private pubSub: PubSub) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => Admin, {
    name: 'admin',
    description: 'Find a single admin by ID.',
  })
  async admin(@Args('id') id: string) {
    return this.adminService.findOne(id)
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Admin)
  async createAdmin(@Args('input') input: CreateAdminInput) {
    return this.adminService.create(input)
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Admin)
  async updateAdmin(@Args('id') id: string, @Args('input') input: UpdateAdminInput) {
    return this.adminService.update(id, input)
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Admin)
  async removeAdmin(@Args('id') id: string) {
    return this.adminService.remove(id)
  }

  @Mutation(() => Admin)
  async registerSuperAdmin(@Args('createAdminInput') createAdminInput: CreateAdminInput) {
    return this.adminService.registerSuperAdmin(createAdminInput)
  }

  @Query(() => PaginatedBusinessesResponse, {name:'all_businesses'})
  all_businesses(@Args('input', { type: () => GetUsersInput }) input: GetUsersInput) {
    return this.userService.getBusinesses(input);
  }

  @Query(() => PaginatedClientsResponse, {name:'all_clients'})
  all_clients(@Args('input', { type: () => GetUsersInput }) input: GetUsersInput) {
    return this.userService.getClients(input);
  }

  @Query(() => PaginatedWorkersResponse, {name:'all_workers'})
  all_workers(@Args('input', { type: () => GetUsersInput }) input: GetUsersInput) {
    return this.userService.getWorkers(input);
  }

  @Query(() => PaginatedAdminsResponse, {name:'all_admins'})
  all_admins(@Args('input', { type: () => GetUsersInput }) input: GetUsersInput) {
    return this.userService.getAdmins(input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => BusinessEntity, { nullable: true })
    async one_business(@Args('id', { type: () => String }) id: string,
  ) {
    return this.userService.getBusiness(id);
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => ClientEntity, { nullable: true })
    async one_client(@Args('id', { type: () => String }) id: string,
  ) {
    return this.userService.getClient(id);
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => WorkerEntity, { nullable: true })
    async one_worker(@Args('id', { type: () => String }) id: string,
  ) {
    return this.userService.getWorker(id);
  }

  @Subscription(() => Admin, {
    resolve: (payload) => payload.newAdmin,
  })
  newAdmin() {
    return this.pubSub.asyncIterableIterator('NEW_ADMIN')
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => BusinessEntity)
  async verifyKyc(@Args('input') input: VerifyKycInput) {
    return this.userService.verifyKyc(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => BusinessEntity)
  async rejectKyc(@Args('input') input: RejectKycInput) {
    return this.userService.rejectKyc(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async updateUserStatus(@Args('input') input: UpdateUserStatusInput) {
    await this.userService.updateUserStatus(input);
    return true;
  }

  @Subscription(() => BusinessEntity, {
    resolve: (payload) => payload.kycVerified,
  })
  kycVerified() {
    return this.pubSub.asyncIterableIterator('KYC_VERIFIED');
  }

  @Subscription(() => BusinessEntity, {
    resolve: (payload) => payload.kycRejected,
  })
  kycRejected() {
    return this.pubSub.asyncIterableIterator('KYC_REJECTED');
  }


}
