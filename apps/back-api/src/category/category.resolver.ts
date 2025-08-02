import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver(() => CategoryEntity)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => CategoryEntity, { description: 'Creates a new category.' })
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
    @Context() context,
  ) {
    return this.categoryService.create(createCategoryInput);
  }

  @Query(() => [CategoryEntity], { name: 'categories', description: 'Retrieves all categories with their products.' })
  async getCategories() {
    return this.categoryService.findAll();
  }

  @Query(() => CategoryEntity, { name: 'category', description: 'Retrieves a single category by ID.' })
  async getCategory(@Args('id', { type: () => String }) id: string) {
    return this.categoryService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => CategoryEntity, { description: 'Updates a category’s details.' })
  async updateCategory(
    @Args('id', { type: () => String }) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
    @Context() context,
  ) {
    return this.categoryService.update(id, updateCategoryInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => CategoryEntity, { description: 'Deletes a category.' })
  async deleteCategory(@Args('id', { type: () => String }) id: string, @Context() context) {
    return this.categoryService.remove(id);
  }
}
