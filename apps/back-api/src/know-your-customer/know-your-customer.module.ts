import { Module } from '@nestjs/common';
import { KnowYourCustomerService } from './know-your-customer.service';
import { KnowYourCustomerResolver } from './know-your-customer.resolver';

@Module({
  providers: [KnowYourCustomerResolver, KnowYourCustomerService],
})
export class KnowYourCustomerModule {}
