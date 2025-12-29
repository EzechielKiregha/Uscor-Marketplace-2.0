import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminResolver } from './admin.resolver'
import { PrismaService } from '../prisma/prisma.service'
import { PubSub } from 'graphql-subscriptions'
import { UserService } from './user.service'

const pubSub = new PubSub()

@Module({
  providers: [
    AdminResolver,
    AdminService,
    UserService,
    PrismaService,
    { provide: 'PUB_SUB', useValue: pubSub },
  ],
  exports: [AdminService],
})
export class AdminModule {}
