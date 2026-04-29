import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { CreatePostOfSaleInput } from "./dto/create-post-of-sale.input";
import type { UpdatePostOfSaleInput } from "./dto/update-post-of-sale.input";
import { PostOfSaleEntity } from "./entities/post-of-sale.entity";
import type { PostOfSaleService } from "./post-of-sale.service";

@Resolver(() => PostOfSaleEntity)
export class PostOfSaleResolver {
	constructor(private readonly postOfSaleService: PostOfSaleService) {}

	@Mutation(() => PostOfSaleEntity)
	createPostOfSale(
		@Args("createPostOfSaleInput")
		createPostOfSaleInput: CreatePostOfSaleInput,
	) {
		return this.postOfSaleService.create(createPostOfSaleInput);
	}

	@Query(() => [PostOfSaleEntity], {
		name: "postOfSale",
	})
	findAll() {
		return this.postOfSaleService.findAll();
	}

	@Query(() => PostOfSaleEntity, {
		name: "postOfSale",
	})
	findOne(@Args("id", { type: () => Int }) id: number) {
		return this.postOfSaleService.findOne(id);
	}

	@Mutation(() => PostOfSaleEntity)
	updatePostOfSale(
		@Args("updatePostOfSaleInput")
		updatePostOfSaleInput: UpdatePostOfSaleInput,
	) {
		return this.postOfSaleService.update(
			updatePostOfSaleInput.id,
			updatePostOfSaleInput,
		);
	}

	@Mutation(() => PostOfSaleEntity)
	removePostOfSale(@Args("id", { type: () => Int }) id: number) {
		return this.postOfSaleService.remove(id);
	}
}
