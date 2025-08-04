import { Module, Injectable } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context, Int, Float } from '@nestjs/graphql';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsDate, IsOptional } from 'class-validator';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StoreService } from '../store/store.service';
import { WorkerService } from '../worker/worker.service';

// DTOs
@InputType()
export class CreateShiftInput {
  @Field()
  @IsString()
  storeId: string;

  @Field()
  @IsDate()
  startTime: Date;
}

@InputType()
export class EndShiftInput {
  @Field()
  @IsString()
  shiftId: string;

  @Field()
  @IsDate()
  endTime: Date;
}

@InputType()
export class UpdateShiftInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  startTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  endTime?: Date;
}

// Entity Definitions
@ObjectType()
export class WorkerEntity {
  @Field()
  id: string;

  @Field()
  fullName: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class StoreEntity {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ShiftEntity {
  @Field()
  id: string;

  @Field()
  workerId: string;

  @Field(() => WorkerEntity)
  worker: WorkerEntity;

  @Field()
  storeId: string;

  @Field(() => StoreEntity)
  store: StoreEntity;

  @Field()
  startTime: Date;

  @Field({ nullable: true })
  endTime?: Date;

  @Field(() => Float)
  sales: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

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
        status: 'COMPLETED',
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
          status: 'COMPLETED',
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
    await this.storeService.verifyStoreAccess(undefined, user); // Ensure user has access to business

    return this.prisma.shift.findMany({
      where: { workerId },
      include: {
        worker: { select: { id: true, fullName: true, createdAt: true } },
        store: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }
}

// Resolver
@Resolver(() => ShiftEntity)
export class ShiftResolver {
  constructor(private readonly shiftService: ShiftService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker', 'business')
  @Mutation(() => ShiftEntity, { description: 'Starts a new shift for a worker.' })
  async createShift(
    @Args('createShiftInput') input: CreateShiftInput,
    @Context() context,
  ) {
    return this.shiftService.createShift(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker', 'business')
  @Mutation(() => ShiftEntity, { description: 'Ends a shift and calculates sales.' })
  async endShift(
    @Args('endShiftInput') input: EndShiftInput,
    @Context() context,
  ) {
    return this.shiftService.endShift(input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Mutation(() => ShiftEntity, { description: 'Updates shift details (business only).' })
  async updateShift(
    @Args('id', { type: () => String }) id: string,
    @Args('updateShiftInput') input: UpdateShiftInput,
    @Context() context,
  ) {
    return this.shiftService.updateShift(id, input, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker', 'business')
  @Query(() => ShiftEntity, { name: 'shift', description: 'Retrieves a single shift.' })
  async getShift(
    @Args('id', { type: () => String }) id: string,
    @Context() context,
  ) {
    return this.shiftService.getShift(id, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  @Query(() => [ShiftEntity], { name: 'shiftsByStore', description: 'Retrieves shifts for a store.' })
  async getShiftsByStore(
    @Args('storeId', { type: () => String }) storeId: string,
    @Context() context,
  ) {
    return this.shiftService.getShiftsByStore(storeId, context.req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('worker', 'business')
  @Query(() => [ShiftEntity], { name: 'shiftsByWorker', description: 'Retrieves shifts for a worker.' })
  async getShiftsByWorker(
    @Args('workerId', { type: () => String }) workerId: string,
    @Context() context,
  ) {
    return this.shiftService.getShiftsByWorker(workerId, context.req.user);
  }
}

// Module
@Module({
  providers: [ShiftResolver, ShiftService, PrismaService, StoreService, WorkerService],
  imports: [StoreModule, WorkerModule],
})
export class ShiftModule {}