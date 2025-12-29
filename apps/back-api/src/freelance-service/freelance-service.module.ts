import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { registerEnumType } from '@nestjs/graphql'
import { FreelanceServiceResolver } from './freelance-service.resolver'
import { FreelanceServiceService } from './freelance-service.service'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()
// Module
@Module({
  providers: [
    FreelanceServiceResolver,
    FreelanceServiceService,
    PrismaService,
    { provide: 'PUB_SUB', useValue: pubSub },
  ],
})
export class FreelanceServiceModule {}
