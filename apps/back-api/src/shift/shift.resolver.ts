import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ShiftService } from './shift.service';
import { CreateShiftInput, EndShiftInput } from './dto/create-shift.input';
import { UpdateShiftInput } from './dto/update-shift.input';
import { ShiftEntity } from './entities/shift.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';

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
