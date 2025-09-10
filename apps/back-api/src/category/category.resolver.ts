import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => CategoryEntity)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => CategoryEntity, { description: 'Creates a new category.' })
  async createCategory(
    @Context() context,
    @Args('input') input: CreateCategoryInput,
  ) {
    return this.categoryService.create(input);
  }

  @Query(() => [CategoryEntity], { name: 'categories', description: 'Retrieves all categories with their products.' })
  async categories() {
    return this.categoryService.findAll();
  }

  @Query(() => CategoryEntity, { name: 'category', description: 'Retrieves a single category by ID.' })
  async category(@Args('id', { type: () => String }) id: string) {
    return this.categoryService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => CategoryEntity, { description: 'Updates a category\'s details.' })
  async updateCategory(
    @Context() context,
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateCategoryInput,
  ) {
    return this.categoryService.update(id, input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => CategoryEntity, { description: 'Deletes a category.' })
  async deleteCategory(@Args('id', { type: () => String }) id: string, @Context() context) {
    return this.categoryService.remove(id);
  }
}