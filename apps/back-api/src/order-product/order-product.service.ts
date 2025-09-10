import { Injectable } from '@nestjs/common'
import { CreateOrderProductInput } from './dto/create-order-product.input'
import { UpdateOrderProductInput } from './dto/update-order-product.input'

@Injectable()
export class OrderProductService {
  create(
    createOrderProductInput: CreateOrderProductInput,
  ) {
    return 'This action adds a new orderProduct'
  }

  findAll() {
    return `This action returns all orderProduct`
  }

  findOne(id: number) {
    return `This action returns a #${id} orderProduct`
  }

  update(
    id: number,
    updateOrderProductInput: UpdateOrderProductInput,
  ) {
    return `This action updates a #${id} orderProduct`
  }

  remove(id: number) {
    return `This action removes a #${id} orderProduct`
  }
}
