import { Module } from '@nestjs/common'
import { DisputeService } from './dispute.service'
import { DisputeResolver } from './dispute.resolver'
import { PrismaService } from '../prisma/prisma.service'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()
@Module({
  providers: [DisputeResolver, DisputeService, PrismaService, { provide: 'PUB_SUB', useValue: pubSub },],
})
export class DisputeModule {}
