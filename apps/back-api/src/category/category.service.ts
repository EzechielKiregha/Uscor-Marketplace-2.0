import { Injectable } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryInput: CreateCategoryInput) {
    return this.prisma.category.create({
      data: {
        ...createCategoryInput,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        products: { select: { id: true, title: true, price: true, stock: true, createdAt: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        products: { select: { id: true, title: true, price: true, stock: true, createdAt: true } },
      },
    });
  }

  async update(id: string, updateCategoryInput: UpdateCategoryInput) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryInput,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
