import { Injectable } from '@nestjs/common';
import { AssignWorkersInput, CreateFreelanceServiceInput, FreelanceServiceCategory } from './dto/create-freelance-service.input';
import { UpdateFreelanceServiceInput } from './dto/update-freelance-service.input';
import { PrismaService } from '../prisma/prisma.service';

// Service
@Injectable()
export class FreelanceServiceService {
  constructor(private prisma: PrismaService) {}

  async create(createFreelanceServiceInput: CreateFreelanceServiceInput, businessId: string) {
    const { title, description, isHourly, rate, category, workerIds } = createFreelanceServiceInput;
    return this.prisma.freelanceService.create({
      data: {
        title,
        description,
        isHourly,
        rate,
        category,
        business: { connect: { id: businessId } },
        workerServiceAssignments: {
          create: workerIds?.map(workerId => ({
            worker: { connect: { id: workerId } },
          })),
        },
      },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        workerServiceAssignments: { include: { worker: true } },
      },
    });
  }

  async findAll(category?: FreelanceServiceCategory) {

    if (category && !Object.values(FreelanceServiceCategory).includes(category)) {
      return this.prisma.freelanceService.findMany({
        include: {
          business: { select: { id: true, name: true, avatar:true, email: true, createdAt: true } },
          workerServiceAssignments: { include: { worker: true } },
      }
      });
    }

    return this.prisma.freelanceService.findMany({
      where: { ...(category ? { category } : {}) },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        workerServiceAssignments: { include: { worker: true } },
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.freelanceService.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        workerServiceAssignments: { include: { worker: true } },
      },
    });
    if (!service) {
      throw new Error('Freelance service not found');
    }
    return service;
  }

  async update(id: string, updateFreelanceServiceInput: UpdateFreelanceServiceInput, businessId: string) {
    const { title, description, isHourly, rate, workerIds } = updateFreelanceServiceInput;
    const service = await this.findOne(id);
    if (service.businessId !== businessId) {
      throw new Error('Businesses can only update their own services');
    }
    return this.prisma.freelanceService.update({
      where: { id },
      data: {
        title,
        description,
        isHourly,
        rate,
        workerServiceAssignments: workerIds
          ? {
              deleteMany: {},
              create: workerIds.map(workerId => ({
                worker: { connect: { id: workerId } },
              })),
            }
          : undefined,
      },
      include: {
        business: { select: { id: true, name: true, email: true } },
        workerServiceAssignments: { include: { worker: true } },
      },
    });
  }

  async assignWorkers(assignWorkersInput: AssignWorkersInput, businessId: string) {
    const { serviceId, workerIds } = assignWorkersInput;
    const service = await this.findOne(serviceId);
    if (service.businessId !== businessId) {
      throw new Error('Businesses can only assign workers to their own services');
    }
    return this.prisma.freelanceService.update({
      where: { id: serviceId },
      data: {
        workerServiceAssignments: {
          deleteMany: {},
          create: workerIds.map(workerId => ({
            worker: { connect: { id: workerId } },
          })),
        },
      },
      include: {
        business: { select: { id: true, name: true, email: true } },
        workerServiceAssignments: { include: { worker: true } },
      },
    });
  }

  async remove(id: string, businessId: string) {
    const service = await this.findOne(id);
    if (service.businessId !== businessId) {
      throw new Error('Businesses can only delete their own services');
    }
    return this.prisma.freelanceService.delete({
      where: { id },
      select: { id: true, title: true },
    });
  }
}

