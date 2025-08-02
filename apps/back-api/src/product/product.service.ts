import { Injectable } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PrismaService } from 'src/prisma/prisma.service';

// Service
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductInput: CreateProductInput) {
    const { businessId, categoryId, ...productData } = createProductInput;
    return this.prisma.product.create({
      data: {
        ...productData,
        business: { connect: { id: businessId } },
        category: { connect: { id: categoryId } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        createdAt: true,
        updatedAt: true,
        business: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        category: { select: { id: true, name: true, description: true, createdAt: true } },
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
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        category: { select: { id: true, name: true, description: true, createdAt: true } },
        orders: { select: { id: true, quantity: true, orderId: true } },
        reposts: { select: { id: true, markupPercentage: true, createdAt: true } },
        reOwnedProducts: { select: { id: true, oldPrice: true, newPrice: true, markupPercentage: true, createdAt: true } },
      },
    });
  }

  async updateStock(id: string, data: { stock: { increment?: number; decrement?: number } }) {
    await this.prisma.product.update({
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
        stock: true,
        createdAt: true,
        updatedAt: true,
        business: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
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
}

