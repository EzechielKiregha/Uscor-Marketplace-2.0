import {
  Resolver,
  Query,
  Args,
  Int,
  Context,
  Subscription,
  Mutation,
} from '@nestjs/graphql'
import { ProductService } from './product.service'
import { ProductEntity } from './entities/product.entity'
import { CreateProductInput } from './dto/create-product.input'
import { UpdateProductInput } from './dto/update-product.input'
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import {
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { MediaEntity } from '../media/entities/media.entity'
import { MediaService } from '../media/media.service'
import { AddMediaInput } from '../media/dto/add-media.input'

const pubSub = new PubSub()

// Resolver
@Resolver(() => ProductEntity)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly mediaService: MediaService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ProductEntity, {
    description:
      'Creates a new product for a business.',
  })
  async createProduct(
    @Context() context,
    @Args('input') input: CreateProductInput,
    @Args('mediaInput') mediaInput: AddMediaInput,
  ) {
    const user = context.req.user
    if (
      user.role === 'business' &&
      user.id !== input.businessId
    ) {
      throw new Error(
        'Businesses can only create products for their own account',
      )
    }
    const product = await this.productService.create(input)

    if (mediaInput) {
        await this.mediaService.addToProduct(
          product.id,
          mediaInput,
        )
      }
    // Publish subscription event
    pubSub.publish('productCreated', {
      productCreated: product,
      businessId: input.businessId,
    })

    return product
  }

  @Query(() => [ProductEntity], {
    name: 'products',
    description:
      'Retrieves all products with their relations.',
  })
  async products() {
    return this.productService.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [ProductEntity], {
    name: 'businessProducts',
    description:
      'Retrieves all products with their relations.',
    })
      async businessProducts(
  @Context() context: any,
      ) {
    const user = context.req.user
    return this.productService.businessProducts(user.id)
  }

  @Query(() => [ProductEntity], {
    name: 'featuredProducts',
    description:
      'Retrieves all featured products with their relations.',
  })
  async featuredProducts() {
    return this.productService.getFeaturedProducts()
  }

  @Query(() => [ProductEntity], {
    name: 'relatedProducts',
    description:
      'Retrieves all featured products with their relations.',
  })
  async relatedProducts(
    @Args('category', { type: () => String })
    category: string,
  ) {
    return this.productService.getRelatedProducts(
      category,
    )
  }

  @Query(() => ProductEntity, {
    name: 'product',
    description:
      'Retrieves a single product by ID.',
  })
  async product(
    @Args('id', { type: () => String })
    id: string,
  ) {
    return this.productService.findOne(id)
  }

  @Query(() => [ProductEntity], {
    name: 'productsByName',
    description: 'Retrieves products by name.',
  })
  async productsByName(
    @Args('storeId', { type: () => String })
    storeId: string,
    @Args('title', { type: () => String })
    title: string,
  ) {
    return this.productService.getFilteredProducts(
      storeId,
      title,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [ProductEntity], {
    name: 'searchedProducts',
    description: 'Retrieves searched products.',
  })
  async searchedProducts(
    @Context() context: any,
    @Args('title', { type: () => String })
    title: string,
  ) {
    const user = context.req.user
    return this.productService.getSearchedProducts(
      title,
      user,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ProductEntity, {
    description: "Updates a product's details.",
  })
  async updateProduct(
    @Context() context,
    @Args('id', { type: () => String })
    id: string,
    @Args('input') input: UpdateProductInput,
    @Args('mediaInput') mediaInput: AddMediaInput,
  ) {
    const user = context.req.user
    let product = await this.productService.findOne(id)

    if (!product) throw new NotFoundException(
        'No product found',
      )

    if (
      user.role === 'business' &&
      user.id !== product.businessId
    ) {
      throw new Error(
        'Businesses can only update their own products',
      )
    }
    if (mediaInput) {
      await this.mediaService.addToProduct(id, mediaInput)
    }
    
    const updatedProduct = this.productService.update(id, input)

    // Publish subscription event
    pubSub.publish('productUpdated', {
      productUpdated: updatedProduct,
      businessId: product.businessId,
    })

    return updatedProduct
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ProductEntity, {
    description: 'Deletes a product.',
  })
  async deleteProduct(
    @Context() context,
    @Args('id', { type: () => String })
    id: string,
  ) {
    const user = context.req.user
    const product =
      await this.productService.findOne(id)

    if (!product)
      throw new NotFoundException(
        'No product found',
      )

    if (
      user.role === 'business' &&
      user.id !== product.businessId
    ) {
      throw new Error(
        'Businesses can only delete their own products',
      )
    }

    return this.productService.remove(id)
  }

  // Media-related mutations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => MediaEntity, {
    description: 'Adds media to a product.',
  })
  async addProductMedia(
    @Args('productId', { type: () => String })
    productId: string,
    @Args('input') input: AddMediaInput,
    @Context() context,
  ) {
    const user = context.req.user
    const product =
      await this.productService.findOne(productId)

    if (!product)
      throw new NotFoundException(
        'No product found',
      )

    if (
      user.role === 'business' &&
      user.id !== product.businessId
    ) {
      throw new Error(
        'Businesses can only add media to their own products',
      )
    }

    return this.mediaService.addToProduct(
      productId,
      input,
    )
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => MediaEntity, {
    description: 'Removes media from a product.',
  })
  async removeProductMedia(
    @Args('mediaId', { type: () => String })
    mediaId: string,
    @Context() context,
  ) {
    const user = context.req.user
    const media =
      await this.mediaService.findOne(mediaId)

    if (!media)
      throw new NotFoundException(
        'No media found',
      )

    // Check if user owns the product that this media belongs to
    if (media.productId) {
      const product =
        await this.productService.findOne(
          media.productId,
        )

      if (!product)
        throw new NotFoundException(
          'No product found',
        )

      if (
        user.role === 'business' &&
        user.id !== product.businessId
      ) {
        throw new Error(
          'Businesses can only remove media from their own products',
        )
      }
    }

    return this.mediaService.remove(mediaId)
  }

  // Subscriptions
  @Subscription(() => ProductEntity, {
    filter: (payload, variables) => {
      return (
        payload.businessId ===
        variables.businessId
      )
    },
  })
  productCreated(
    @Args('businessId') businessId: string,
  ) {
    return pubSub.asyncIterableIterator(
      'productCreated',
    )
  }

  @Subscription(() => ProductEntity, {
    filter: (payload, variables) => {
      return (
        payload.businessId ===
        variables.businessId
      )
    },
  })
  productUpdated(
    @Args('businessId') businessId: string,
  ) {
    return pubSub.asyncIterableIterator(
      'productUpdated',
    )
  }
}
