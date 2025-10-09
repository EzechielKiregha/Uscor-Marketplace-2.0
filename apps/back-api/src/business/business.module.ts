import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BusinessService } from './business.service'
import { BusinessResolver } from './business.resolver'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()

// Module
@Module({
  providers: [
    BusinessResolver,
    BusinessService,
    PrismaService,
    { provide: 'PUB_SUB', useValue: pubSub },
  ],
})
export class BusinessModule {}
