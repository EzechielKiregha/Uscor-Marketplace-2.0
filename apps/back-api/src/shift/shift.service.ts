import { Injectable } from '@nestjs/common';
import { CreateShiftInput, EndShiftInput } from './dto/create-shift.input';
import { UpdateShiftInput } from './dto/update-shift.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkerService } from 'src/worker/worker.service';
import { StoreService } from 'src/store/store.service';

// Service
@Injectable()
export class ShiftService {
  constructor(
    private prisma: PrismaService,
    private storeService: StoreService,
    private workerService: WorkerService,
  ) {}

  async createShift(input: CreateShiftInput, user: { id: string; role: string }) {
    const { storeId, startTime } = input;

    // Validate store and worker access
    await this.storeService.verifyStoreAccess(storeId, user);
    const worker = await this.workerService.findOne(user.id);
    if (!worker) {
      throw new Error('Worker not found');
    }

    return this.prisma.shift.create({
      data: {
        worker: { connect: { id: user.id } },
        store: { connect: { id: storeId } },
        startTime,
        sales: 0,
      },
      include: {
        worker: { select: { id: true, fullName: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async endShift(input: EndShiftInput, user: { id: string; role: string }) {
    const { shiftId, endTime } = input;

    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { store: true, worker: true },
    });
    if (!shift) {
      throw new Error('Shift not found');
    }
    if (shift.workerId !== user.id && user.role !== 'business') {
      throw new Error('Only the shift worker or business owner can end the shift');
    }
    await this.storeService.verifyStoreAccess(shift.storeId, user);

    // Calculate total sales during the shift
    const sales = await this.prisma.sale.aggregate({
      where: {
        workerId: shift.workerId,
        storeId: shift.storeId,
        createdAt: { gte: shift.startTime, lte: endTime },
        status: 'CLOSED',
      },
      _sum: { totalAmount: true },
    });

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        endTime,
        sales: sales._sum.totalAmount || 0,
      },
      include: {
        worker: { select: { id: true, fullName: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async updateShift(id: string, input: UpdateShiftInput, user: { id: string; role: string }) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!shift) {
      throw new Error('Shift not found');
    }
    if (user.role !== 'business') {
      throw new Error('Only business owners can update shift details');
    }
    await this.storeService.verifyStoreAccess(shift.storeId, user);

    // Recalculate sales if startTime or endTime changes
    let sales = shift.sales;
    if (input.startTime || input.endTime) {
      const salesPeriod = await this.prisma.sale.aggregate({
        where: {
          workerId: shift.workerId,
          storeId: shift.storeId,
          createdAt: {
            gte: input.startTime || shift.startTime,
            lte: input.endTime || shift.endTime || new Date(),
          },
          status: 'CLOSED',
        },
        _sum: { totalAmount: true },
      });
      sales = salesPeriod._sum.totalAmount || 0;
    }

    return this.prisma.shift.update({
      where: { id },
      data: {
        startTime: input.startTime,
        endTime: input.endTime,
        sales,
      },
      include: {
        worker: { select: { id: true, fullName: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async getShift(id: string, user: { id: string; role: string }) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { store: true, worker: true },
    });
    if (!shift) {
      throw new Error('Shift not found');
    }
    if (shift.workerId !== user.id && user.role !== 'business') {
      throw new Error('Only the shift worker or business owner can view the shift');
    }
    await this.storeService.verifyStoreAccess(shift.storeId, user);

    return shift;
  }

  async getShiftsByStore(storeId: string, user: { id: string; role: string }) {
    await this.storeService.verifyStoreAccess(storeId, user);

    return this.prisma.shift.findMany({
      where: { storeId },
      include: {
        worker: { select: { id: true, fullName: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async getShiftsByWorker(workerId: string, user: { id: string; role: string }) {
    if (workerId !== user.id && user.role !== 'business') {
      throw new Error('Only the worker or business owner can view worker shifts');
    }
    const worker = await this.workerService.findOne(workerId);
    if (!worker) {
      throw new Error('Worker not found');
    }
    await this.storeService.verifyBusinessAccess(user); // Ensure user has access to business

    return this.prisma.shift.findMany({
      where: { workerId },
      include: {
        worker: { select: { id: true, fullName: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }
}

