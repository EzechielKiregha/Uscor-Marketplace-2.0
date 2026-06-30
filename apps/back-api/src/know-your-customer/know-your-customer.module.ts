import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { PrismaService } from '../prisma/prisma.service'
import { KnowYourCustomerResolver } from './know-your-customer.resolver'
import { KnowYourCustomerService } from './know-your-customer.service'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()

@Module({
  providers: [
    KnowYourCustomerResolver,
    KnowYourCustomerService,
    PrismaService,
    { provide: 'PUB_SUB', useValue: pubSub },
  ],
  imports: [PrismaModule],
})
export class KnowYourCustomerModule {}
