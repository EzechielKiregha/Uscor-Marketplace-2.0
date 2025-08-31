import { Injectable } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PrismaService } from '../prisma/prisma.service';

// Service
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductInput: CreateProductInput) {
    const { businessId, categoryId, storeId, ...productData } = createProductInput;
    return this.prisma.product.create({
      data: {
        ...productData,
        store: { connect : { id: storeId } },
        business: { connect: { id: businessId } },
        category: { connect: { id: categoryId } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        quantity: true,
        approvedForSale: true,
        createdAt: true,
        updatedAt: true,
        business: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        store : { select: { id: true, name: true  } }
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        medias: { select: { id: true, url : true, type: true }},
        business: { select: { id: true, name: true, email: true, avatar: true } },
        category: { select: { id: true, name: true, description: true, createdAt: true } },
        store : { select: { id: true, name: true, address: true, createdAt: true  } },
        orders: { select: { id: true, quantity: true, orderId: true } },
        reposts: { select: { id: true, markupPercentage: true, createdAt: true } },
        reOwnedProducts: { select: { id: true, oldPrice: true, newPrice: true, markupPercentage: true, createdAt: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        medias: { select: { id: true, url : true, type: true } },
        business: { select: { id: true, name: true, email: true, avatar: true } },
        category: { select: { id: true, name: true, description: true, createdAt: true } },
        store : { select: { id: true, name: true, address: true, createdAt: true  } },
        orders: { select: { id: true, quantity: true, orderId: true } },
        reposts: { select: { id: true, markupPercentage: true, createdAt: true } },
        reOwnedProducts: { select: { id: true, oldPrice: true, newPrice: true, markupPercentage: true, createdAt: true } },
      },
    });
  }

  async updateStock(id: string, data: { quantity: { increment?: number; decrement?: number } }) {
    return await this.prisma.product.update({
      where : { id },
      data
    })
  }

  async update(id: string, updateProductInput: UpdateProductInput) {
    const { categoryId, ...productData } = updateProductInput;
    const data: any = { ...productData };

    if (categoryId) {
      data.category = { connect: { id: categoryId } };
    }

    return this.prisma.product.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        quantity: true,
        approvedForSale: true,
        createdAt: true,
        updatedAt: true,
        medias: {select:{url:true}},
        business: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        store : { select: { id: true, name: true, address: true, createdAt: true  } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
      select: {
        id: true,
        title: true,
      },
    });
  }

  async getFeaturedProducts() {
    return await this.prisma.product.findMany({
      where: { featured: true },
      select: {
        id: true,
        title: true,
        price: true,
        quantity: true,
        description: true,
        medias: {select:{url:true}},
        approvedForSale: true,
        category: { select: { name: true } },
        business: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' }, // show newest first
    });
  }
  
  async getRelatedProducts(category: string) {
    if (!category) {
      throw new Error('Category is required to fetch related products');
    }
    const cat = await this.prisma.category.findUnique({
      where: { name: category },
      select: { id: true },
    });
    if (!cat) {
      throw new Error(`Category "${category}" not found`);
    }
    return await this.prisma.product.findMany({
      where: { categoryId: cat.id },
      take: 4, // Limit to 4 related products
      select: {
        id: true,
        title: true,
        price: true,
        quantity: true,
        description: true,
        medias: {select:{url:true}},
        approvedForSale: true,
        category: { select: { name: true } },
        business: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' }, // show newest first
    });
  }
  async getFilteredProducts(title: string) {
    return await this.prisma.product.findMany({
      where: { 
        title: {
          contains: title, mode: 'insensitive'
        }
      }, // Limit to 4 related products
      include: {
        medias: { select: { id: true, url : true, type: true }},
        business: { select: { id: true, name: true, email: true, avatar: true } },
        category: { select: { id: true, name: true, description: true, createdAt: true } },
        store : { select: { id: true, name: true, address: true, createdAt: true  } },
        orders: { select: { id: true, quantity: true, orderId: true } },
        reposts: { select: { id: true, markupPercentage: true, createdAt: true } },
        reOwnedProducts: { select: { id: true, oldPrice: true, newPrice: true, markupPercentage: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' }, // show newest first
    });
  }
}

