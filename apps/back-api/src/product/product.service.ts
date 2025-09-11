import { Injectable } from '@nestjs/common'
import { CreateProductInput } from './dto/create-product.input'
import { UpdateProductInput } from './dto/update-product.input'
import { PrismaService } from '../prisma/prisma.service'
import { AuthPayload } from '../auth/entities/auth-payload.entity'

// Service
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductInput: CreateProductInput,
  ) {
    const {
      businessId,
      categoryId,
      storeId,
      ...productData
    } = createProductInput
    return this.prisma.product.create({
      data: {
        ...productData,
        storeId,
        businessId,
        categoryId,
      },
      include: {
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
    })
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            createdAt: true,
          },
        },
        orders: {
          select: {
            id: true,
            quantity: true,
            orderId: true,
          },
        },
        reposts: {
          select: {
            id: true,
            markupPercentage: true,
            createdAt: true,
          },
        },
        reOwnedProducts: {
          select: {
            id: true,
            oldPrice: true,
            newPrice: true,
            markupPercentage: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        medias: true,
        business: true,
        category: true,
        store: true,
        orders: true,
        reposts: true,
        reOwnedProducts: true
      },
    })
  }

  async updateStock(
    id: string,
    data: {
      quantity: {
        increment?: number
        decrement?: number
      }
    },
  ) {
    return await this.prisma.product.update({
      where: { id },
      data,
    })
  }

  async update(id: string, input: UpdateProductInput) {
    const { categoryId, storeId, businessId, ...productData } = input
  
    const data: any = { ...productData }
  
    if (categoryId) {
      data.category = { connect: { id: categoryId } }
    }
    if (storeId) {
      data.store = { connect: { id: storeId } }
    }
    if (businessId) {
      data.business = { connect: { id: businessId } }
    }
  
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        medias: { select: { id: true, url: true, type: true } },
        business: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, description: true } },
        store: { select: { id: true, name: true } },
      },
    })
  }
  

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
      select: {
        id: true,
        title: true,
      },
    })
  }

  async getFeaturedProducts() {
    return await this.prisma.product.findMany({
      where: { featured: true },
      include: {
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' }, // show newest first
    })
  }

  async getRelatedProducts(category: string) {
    if (!category) {
      throw new Error(
        'Category is required to fetch related products',
      )
    }
    const cat =
      await this.prisma.category.findUnique({
        where: { name: category },
        select: { id: true },
      })
    if (!cat) {
      throw new Error(
        `Category "${category}" not found`,
      )
    }
    return await this.prisma.product.findMany({
      where: { categoryId: cat.id },
      take: 10, // Limit to 4 related products
      include: {
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' }, // show newest first
    })
  }
  async getFilteredProducts(
    storeId: string,
    title: string,
  ) {
    return await this.prisma.product.findMany({
      where: {
        storeId,
        title: {
          contains: title,
          mode: 'insensitive',
        },
      },
      include: {
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' }, // show newest first
    })
  }
  async getSearchedProducts(
    title: string,
    user: AuthPayload,
  ) {
    if (user.role !== 'business') {
      throw new Error(
        'You are not allowed to search for products',
      )
    }

    return await this.prisma.product.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
      },
      include: {
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' }, // show newest first
    })
  }
}
