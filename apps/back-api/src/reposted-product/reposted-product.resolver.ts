import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RepostedProductEntity } from "./entities/reposted-product.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UseGuards } from "@nestjs/common";
import { RepostedProductService } from "./reposted-product.service";
import { CreateRepostedProductInput } from "./dto/create-reposted-product.input";

// Resolver
@Resolver(() => RepostedProductEntity)
export class RepostedProductResolver {
  constructor(
    private readonly repostedProductService: RepostedProductService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => RepostedProductEntity, { description: 'Creates a reposted product.' })
  async createRepostedProduct(
    @Args('createRepostedProductInput') createRepostedProductInput: CreateRepostedProductInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (user.id !== createRepostedProductInput.businessId) {
      throw new Error('Businesses can only repost for themselves');
    }
    return this.repostedProductService.create(createRepostedProductInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [RepostedProductEntity], { name: 'repostedProducts', description: 'Retrieves reposted products for a business.' })
  async getRepostedProducts(@Context() context) {
    const user = context.req.user;
    return this.repostedProductService.findAll(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => RepostedProductEntity, { name: 'repostedProduct', description: 'Retrieves a single reposted product by ID.' })
  async getRepostedProduct(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.repostedProductService.findOne(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => RepostedProductEntity, { description: 'Deletes a reposted product.' })
  async deleteRepostedProduct(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.repostedProductService.remove(id, user.id);
  }
}

