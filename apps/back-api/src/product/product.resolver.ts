import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { ProductEntity } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotFoundException, UseGuards } from '@nestjs/common';

// Resolver
@Resolver(() => ProductEntity)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ProductEntity, { description: 'Creates a new product for a business.' })
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (user.role === 'business' && user.id !== createProductInput.businessId) {
      throw new Error('Businesses can only create products for their own account');
    }
    return this.productService.create(createProductInput);
  }

  @Query(() => [ProductEntity], { name: 'products', description: 'Retrieves all products with their relations.' })
  async getProducts() {
    return this.productService.findAll();
  }
  
  @Query(() => [ProductEntity], { name: 'featuredProducts', description: 'Retrieves all featured products with their relations.' })
  async featuredProducts() {
    return this.productService.getFeaturedProducts();
  }

  @Query(() => [ProductEntity], { name: 'relatedProducts', description: 'Retrieves all featured products with their relations.' })
  async relatedProducts(@Args('category', { type: () => String }) category: string) {
    return this.productService.getRelatedProducts(category);
  }

  @Query(() => ProductEntity, { name: 'product', description: 'Retrieves a single product by ID.' })
  async getProduct(@Args('id', { type: () => String }) id: string) {
    return this.productService.findOne(id);
  }
  @Query(() => [ProductEntity], { name: 'productsByName', description: 'Retrieves a single product by name.' })
  async getProductsByName(@Args('title', { type: () => String }) title: string) {
    return this.productService.getFilteredProducts(title);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ProductEntity, { description: 'Updates a product’s details.' })
  async updateProduct(
    @Args('id', { type: () => String }) id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
    @Context() context,
  ) {
    const user = context.req.user;
    const product = await this.productService.findOne(id);

    if (!product) return new NotFoundException("No product found")

    if (user.role === 'business' && user.id !== product.businessId) {
      throw new Error('Businesses can only update their own products');
    }
    return this.productService.update(id, updateProductInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ProductEntity, { description: 'Deletes a product.' })
  async deleteProduct(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    const product = await this.productService.findOne(id);

    if (!product) return new NotFoundException("No product found")
      
    if (user.role === 'business' && user.id !== product.businessId) {
      throw new Error('Businesses can only delete their own products');
    }
    return this.productService.remove(id);
  }
}
