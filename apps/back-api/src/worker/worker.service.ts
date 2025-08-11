import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateWorkerInput, WorkerRole } from './dto/create-worker.input';
import { UpdateWorkerInput } from './dto/update-worker.input';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkerInput: CreateWorkerInput) {
    const { password, businessId, kycId, role, ...workerData } = createWorkerInput;
    const hashedPassword = await hash(password);

    if (!businessId) return new UnauthorizedException("Business ID is missing")

    return this.prisma.worker.create({
      data: {
        ...workerData,
        role : role || WorkerRole.STAFF,
        password: hashedPassword,
        business: {
          connect : { id : businessId}
        },
        kyc: kycId ? { connect: { id: kycId } } : undefined,

      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        business: { select: { id: true, name: true, email: true } },
        kyc: { select: { id: true, status: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.worker.findMany({
      include: {
        business: { select: { id: true, name: true, email: true, description: true, createdAt: true } },
        kyc: { select: { id: true, status: true, submittedAt: true, verifiedAt: true } },
        workerServiceAssignments: { select: { id: true, freelanceService : { select : {id : true, title: true, isHourly: true, rate: true, createdAt: true} } } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.worker.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, email: true, description: true, createdAt: true } },
        kyc: { select: { id: true, status: true, submittedAt: true, verifiedAt: true } },
        workerServiceAssignments: { select: { id: true, freelanceService : { select : {id : true, title: true, isHourly: true, rate: true, createdAt: true} } } },
      },
    });
  }

  async update(id: string, updateWorkerInput: UpdateWorkerInput) {
    const { password, businessId, kycId, ...workerData } = updateWorkerInput;
    const data: any = { ...workerData };

    if (password) {
      data.password = await hash(password);
    }
    if (businessId) {
      data.business = { connect: { id: businessId } };
    }
    if (kycId) {
      data.kyc = { connect: { id: kycId } };
    }

    return this.prisma.worker.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        business: { select: { id: true, name: true, email: true } },
        kyc: { select: { id: true, status: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.worker.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });
  }
}
