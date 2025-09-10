import { Injectable } from '@nestjs/common'
import { CreateKnowYourCustomerInput } from './dto/create-know-your-customer.input'
import { UpdateKnowYourCustomerInput } from './dto/update-know-your-customer.input'

@Injectable()
export class KnowYourCustomerService {
  create(
    createKnowYourCustomerInput: CreateKnowYourCustomerInput,
  ) {
    return 'This action adds a new knowYourCustomer'
  }

  findAll() {
    return `This action returns all knowYourCustomer`
  }

  findOne(id: number) {
    return `This action returns a #${id} knowYourCustomer`
  }

  update(
    id: number,
    updateKnowYourCustomerInput: UpdateKnowYourCustomerInput,
  ) {
    return `This action updates a #${id} knowYourCustomer`
  }

  remove(id: number) {
    return `This action removes a #${id} knowYourCustomer`
  }
}
