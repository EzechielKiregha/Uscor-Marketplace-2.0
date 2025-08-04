import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ShiftService } from './shift.service';
import { Shift } from './entities/shift.entity';
import { CreateShiftInput } from './dto/create-shift.input';
import { UpdateShiftInput } from './dto/update-shift.input';

@Resolver(() => Shift)
export class ShiftResolver {
  constructor(private readonly shiftService: ShiftService) {}

  @Mutation(() => Shift)
  createShift(@Args('createShiftInput') createShiftInput: CreateShiftInput) {
    return this.shiftService.create(createShiftInput);
  }

  @Query(() => [Shift], { name: 'shift' })
  findAll() {
    return this.shiftService.findAll();
  }

  @Query(() => Shift, { name: 'shift' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.shiftService.findOne(id);
  }

  @Mutation(() => Shift)
  updateShift(@Args('updateShiftInput') updateShiftInput: UpdateShiftInput) {
    return this.shiftService.update(updateShiftInput.id, updateShiftInput);
  }

  @Mutation(() => Shift)
  removeShift(@Args('id', { type: () => Int }) id: number) {
    return this.shiftService.remove(id);
  }
}
