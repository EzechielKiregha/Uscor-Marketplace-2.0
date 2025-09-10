import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
} from '@nestjs/graphql'
import { KnowYourCustomerService } from './know-your-customer.service'
import { KnowYourCustomerEntity } from './entities/know-your-customer.entity'

@Resolver(() => KnowYourCustomerEntity)
export class KnowYourCustomerResolver {
  constructor(
    private readonly knowYourCustomerService: KnowYourCustomerService,
  ) {}
}
