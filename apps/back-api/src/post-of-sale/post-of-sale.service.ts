import { Injectable } from '@nestjs/common'
import { CreatePostOfSaleInput } from './dto/create-post-of-sale.input'
import { UpdatePostOfSaleInput } from './dto/update-post-of-sale.input'

@Injectable()
export class PostOfSaleService {
  create(
    createPostOfSaleInput: CreatePostOfSaleInput,
  ) {
    return 'This action adds a new postOfSale'
  }

  findAll() {
    return `This action returns all postOfSale`
  }

  findOne(id: number) {
    return `This action returns a #${id} postOfSale`
  }

  update(
    id: number,
    updatePostOfSaleInput: UpdatePostOfSaleInput,
  ) {
    return `This action updates a #${id} postOfSale`
  }

  remove(id: number) {
    return `This action removes a #${id} postOfSale`
  }
}
