import { Injectable } from '@nestjs/common';
import { CreateShiftInput } from './dto/create-shift.input';
import { UpdateShiftInput } from './dto/update-shift.input';

@Injectable()
export class ShiftService {
  create(createShiftInput: CreateShiftInput) {
    return 'This action adds a new shift';
  }

  findAll() {
    return `This action returns all shift`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shift`;
  }

  update(id: number, updateShiftInput: UpdateShiftInput) {
    return `This action updates a #${id} shift`;
  }

  remove(id: number) {
    return `This action removes a #${id} shift`;
  }
}
