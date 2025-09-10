import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
} from '@nestjs/graphql'
import { PostOfSaleService } from './post-of-sale.service'
import { PostOfSaleEntity } from './entities/post-of-sale.entity'
import { CreatePostOfSaleInput } from './dto/create-post-of-sale.input'
import { UpdatePostOfSaleInput } from './dto/update-post-of-sale.input'

@Resolver(() => PostOfSaleEntity)
export class PostOfSaleResolver {
  constructor(
    private readonly postOfSaleService: PostOfSaleService,
  ) {}

  @Mutation(() => PostOfSaleEntity)
  createPostOfSale(
    @Args('createPostOfSaleInput')
    createPostOfSaleInput: CreatePostOfSaleInput,
  ) {
    return this.postOfSaleService.create(
      createPostOfSaleInput,
    )
  }

  @Query(() => [PostOfSaleEntity], {
    name: 'postOfSale',
  })
  findAll() {
    return this.postOfSaleService.findAll()
  }

  @Query(() => PostOfSaleEntity, {
    name: 'postOfSale',
  })
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.postOfSaleService.findOne(id)
  }

  @Mutation(() => PostOfSaleEntity)
  updatePostOfSale(
    @Args('updatePostOfSaleInput')
    updatePostOfSaleInput: UpdatePostOfSaleInput,
  ) {
    return this.postOfSaleService.update(
      updatePostOfSaleInput.id,
      updatePostOfSaleInput,
    )
  }

  @Mutation(() => PostOfSaleEntity)
  removePostOfSale(
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.postOfSaleService.remove(id)
  }
}
