import { Injectable } from '@nestjs/common'
import { CreateReferralInput } from './dto/create-referral.input'
import { UpdateReferralInput } from './dto/update-referral.input'

@Injectable()
export class ReferralService {
  create(
    createReferralInput: CreateReferralInput,
  ) {
    return 'This action adds a new referral'
  }

  findAll() {
    return `This action returns all referral`
  }

  findOne(id: number) {
    return `This action returns a #${id} referral`
  }

  update(
    id: number,
    updateReferralInput: UpdateReferralInput,
  ) {
    return `This action updates a #${id} referral`
  }

  remove(id: number) {
    return `This action removes a #${id} referral`
  }
}
