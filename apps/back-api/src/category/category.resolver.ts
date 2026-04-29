import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { CategoryService } from "./category.service";
import type { CreateCategoryInput } from "./dto/create-category.input";
import type { UpdateCategoryInput } from "./dto/update-category.input";
import { CategoryEntity } from "./entities/category.entity";

@Resolver(() => CategoryEntity)
export class CategoryResolver {
	constructor(private readonly categoryService: CategoryService) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Mutation(() => CategoryEntity, {
		description: "Creates a new category.",
	})
	async createCategory(
		@Context() _context,
		@Args("createCategoryInput")
		createCategoryInput: CreateCategoryInput,
	) {
		return this.categoryService.create(createCategoryInput);
	}

	@Query(() => [CategoryEntity], {
		name: "categories",
		description: "Retrieves all categories with their products.",
	})
	async categories() {
		return this.categoryService.findAll();
	}

	@Query(() => CategoryEntity, {
		name: "category",
		description: "Retrieves a single category by ID.",
	})
	async category(
		@Args("id", { type: () => String })
		id: string,
	) {
		return this.categoryService.findOne(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Mutation(() => CategoryEntity, {
		description: "Updates a category's details.",
	})
	async updateCategory(
		@Context() _context,
		@Args("id", { type: () => String })
		id: string,
		@Args("updateCategoryInput")
		updateCategoryInput: UpdateCategoryInput,
	) {
		return this.categoryService.update(id, updateCategoryInput);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Mutation(() => CategoryEntity, {
		description: "Deletes a category.",
	})
	async deleteCategory(
		@Args("id", { type: () => String })
		id: string,
		@Context() _context,
	) {
		return this.categoryService.remove(id);
	}
}
