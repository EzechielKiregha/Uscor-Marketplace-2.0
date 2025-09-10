import { Injectable } from '@nestjs/common';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(createMediaInput: CreateMediaInput) {
  // Build Prisma-compatible update payload to avoid DTO type mismatches
  const dataClause: any = {};

  if (createMediaInput.url !== undefined) dataClause['url'] = createMediaInput.url;
  if (createMediaInput.type !== undefined) dataClause['type'] = createMediaInput.type as any;

  // Prefer FK-based updates; avoid mixing with nested objects
  if (createMediaInput.productId !== undefined)
    dataClause['productId'] = createMediaInput.productId;
  if (createMediaInput.businessId !== undefined)
    dataClause['businessId'] = createMediaInput.businessId;
  if (createMediaInput.storeId !== undefined)
    dataClause['storeId'] = createMediaInput.storeId;
  if (createMediaInput.clientId !== undefined)
    dataClause['clientId'] = createMediaInput.clientId;
  if (createMediaInput.workerId !== undefined)
    dataClause['workerId'] = createMediaInput.workerId;
  if (createMediaInput.serviceId !== undefined)
    dataClause['serviceId'] = createMediaInput.serviceId;

  // Fallback to nested connect if IDs not provided but nested objects include an id
  if (createMediaInput.product && !createMediaInput.productId && (createMediaInput as any).product?.id) {
    dataClause['product'] = { connect: { id: (createMediaInput as any).product.id } };
  }
  if (createMediaInput.business && !createMediaInput.businessId && (createMediaInput as any).business?.id) {
    dataClause['business'] = { connect: { id: (createMediaInput as any).business.id } };
  }
  if (createMediaInput.store && !createMediaInput.storeId && (createMediaInput as any).store?.id) {
    dataClause['store'] = { connect: { id: (createMediaInput as any).store.id } };
  }
  if (createMediaInput.client && !createMediaInput.clientId && (createMediaInput as any).client?.id) {
    dataClause['client'] = { connect: { id: (createMediaInput as any).client.id } };
  }
  if (createMediaInput.worker && !createMediaInput.workerId && (createMediaInput as any).worker?.id) {
    dataClause['worker'] = { connect: { id: (createMediaInput as any).worker.id } };
  }
  if (createMediaInput.service && !createMediaInput.serviceId && (createMediaInput as any).service?.id) {
    dataClause['service'] = { connect: { id: (createMediaInput as any).service.id } };
  }

  if (Object.keys(dataClause).length === 0) throw new Error('No data to update');

    return this.prisma.media.create({
      data: dataClause,
      select: {
        id: true,
        url: true,
        type: true,
        productId: true,
        createdAt: true,
      },
    });
  }

  async addToProduct(productId: string, input: any) {
    return this.prisma.media.create({
      data: {
        ...input,
        product: { connect: { id: productId } },
      },
      select: {
        id: true,
        url: true,
        type: true,
        productId: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.media.findMany({
      select: {
        id: true,
        url: true,
        type: true,
        productId: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.media.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        type: true,
        productId: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateMediaInput: UpdateMediaInput) {
    // Build Prisma-compatible update payload to avoid DTO type mismatches
    const dataClause: any = {};

    if (updateMediaInput.url !== undefined) dataClause['url'] = updateMediaInput.url;
    if (updateMediaInput.type !== undefined) dataClause['type'] = updateMediaInput.type as any;

    // Prefer FK-based updates; avoid mixing with nested objects
    if (updateMediaInput.productId !== undefined)
      dataClause['productId'] = updateMediaInput.productId;
    if (updateMediaInput.businessId !== undefined)
      dataClause['businessId'] = updateMediaInput.businessId;
    if (updateMediaInput.storeId !== undefined)
      dataClause['storeId'] = updateMediaInput.storeId;
    if (updateMediaInput.clientId !== undefined)
      dataClause['clientId'] = updateMediaInput.clientId;
    if (updateMediaInput.workerId !== undefined)
      dataClause['workerId'] = updateMediaInput.workerId;
    if (updateMediaInput.serviceId !== undefined)
      dataClause['serviceId'] = updateMediaInput.serviceId;

    // Fallback to nested connect if IDs not provided but nested objects include an id
    if (updateMediaInput.product && !updateMediaInput.productId && (updateMediaInput as any).product?.id) {
      dataClause['product'] = { connect: { id: (updateMediaInput as any).product.id } };
    }
    if (updateMediaInput.business && !updateMediaInput.businessId && (updateMediaInput as any).business?.id) {
      dataClause['business'] = { connect: { id: (updateMediaInput as any).business.id } };
    }
    if (updateMediaInput.store && !updateMediaInput.storeId && (updateMediaInput as any).store?.id) {
      dataClause['store'] = { connect: { id: (updateMediaInput as any).store.id } };
    }
    if (updateMediaInput.client && !updateMediaInput.clientId && (updateMediaInput as any).client?.id) {
      dataClause['client'] = { connect: { id: (updateMediaInput as any).client.id } };
    }
    if (updateMediaInput.worker && !updateMediaInput.workerId && (updateMediaInput as any).worker?.id) {
      dataClause['worker'] = { connect: { id: (updateMediaInput as any).worker.id } };
    }
    if (updateMediaInput.service && !updateMediaInput.serviceId && (updateMediaInput as any).service?.id) {
      dataClause['service'] = { connect: { id: (updateMediaInput as any).service.id } };
    }

    if (Object.keys(dataClause).length === 0) throw new Error('No data to update');

    return this.prisma.media.update({
      where: { id },
      data: dataClause,
      select: {
        id: true,
        url: true,
        type: true,
        productId: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.media.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }
}
