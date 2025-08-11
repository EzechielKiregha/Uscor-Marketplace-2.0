import { Injectable } from '@nestjs/common';
import { CreateStoreInput } from './dto/create-store.input';
import { UpdateStoreInput } from './dto/update-store.input';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { WorkerService } from '../worker/worker.service';

// Service
@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
    private workerService: WorkerService,
  ) {}

  async create(createStoreInput: CreateStoreInput) {
    const { businessId, name, address } = createStoreInput;

    // Validate business using BusinessService
    const business = await this.businessService.findOne(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    return this.prisma.store.create({
      data: {
        business: { connect: { id: businessId } },
        name,
        address,
      },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });
  }

  async update(id: string, updateStoreInput: UpdateStoreInput, businessId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: { businessId: true },
    });
    if (!store) {
      throw new Error('Store not found');
    }
    if (store.businessId !== businessId) {
      throw new Error('Only the owning business can update this store');
    }

    return this.prisma.store.update({
      where: { id },
      data: {
        name: updateStoreInput.name,
        address: updateStoreInput.address,
      },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });
  }

  async remove(id: string, businessId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: { businessId: true },
    });
    if (!store) {
      throw new Error('Store not found');
    }
    if (store.businessId !== businessId) {
      throw new Error('Only the owning business can delete this store');
    }

    // Check for dependencies
    const sales = await this.prisma.sale.findFirst({ where: { storeId: id } });
    if (sales) {
      throw new Error('Cannot delete store with associated sales');
    }
    const products = await this.prisma.product.findFirst({ where: { storeId: id } });
    if (products) {
      throw new Error('Cannot delete store with associated products');
    }

    return this.prisma.store.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }

  async findAll(businessId: string) {
    return this.prisma.store.findMany({
      where: { businessId },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });
    if (!store) {
      throw new Error('Store not found');
    }
    return store;
  }

  async verifyStoreAccess(storeId: string , user: { id: string; role: string }) {
    const store = await this.findOne(storeId);
    if (user.role === 'business' && store.businessId !== user.id) {
      throw new Error('Business can only access their own stores');
    }
    if (user.role === 'worker') {
      const worker = await this.workerService.findOne(user.id);
      
      if (!worker) throw new Error("Worker not found")

      if (store.businessId !== worker.businessId) {
        throw new Error('Worker can only access stores of their business');
      }
    }
    return store;
  }
  async verifyBusinessAccess( user: { id: string; role: string }) {
    
    const worker = await this.workerService.findOne(user.id);
    
    if (!worker) throw new Error("Worker not found")

      const business = this.businessService.findOne(worker.businessId)

    if (!business) {
      throw new Error('Worker can only access stores of their business');
    }
  
    return true;
  }
}

