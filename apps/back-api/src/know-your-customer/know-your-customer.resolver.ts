import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { KnowYourCustomerService } from './know-your-customer.service';
import { KnowYourCustomerEntity } from './entities/know-your-customer.entity';
import { CreateKnowYourCustomerInput } from './dto/create-know-your-customer.input';
import { UpdateKnowYourCustomerInput } from './dto/update-know-your-customer.input';

@Resolver(() => KnowYourCustomerEntity)
export class KnowYourCustomerResolver {
  constructor(private readonly knowYourCustomerService: KnowYourCustomerService) {}
}
