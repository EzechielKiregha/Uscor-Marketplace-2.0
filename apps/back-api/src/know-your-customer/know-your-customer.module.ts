import { Module } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { PusherService } from '../chat/pusher.service'
import { PrismaModule } from '../prisma/prisma.module'
import { PrismaService } from '../prisma/prisma.service'
import { KnowYourCustomerResolver } from './know-your-customer.resolver'
import { KnowYourCustomerService } from './know-your-customer.service'

const pubSub = new PubSub()

@Module({
  providers: [
    KnowYourCustomerResolver,
    KnowYourCustomerService,
    PrismaService,
    PusherService,
    { provide: 'PUB_SUB', useValue: pubSub },
  ],
  imports: [PrismaModule],
})
export class KnowYourCustomerModule {}
