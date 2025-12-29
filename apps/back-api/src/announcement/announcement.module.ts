import { Module } from '@nestjs/common'
import { AnnouncementService } from './announcement.service'
import { AnnouncementResolver } from './announcement.resolver'
import { PrismaService } from '../prisma/prisma.service'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()

@Module({
  providers: [AnnouncementResolver, AnnouncementService, PrismaService, { provide: 'PUB_SUB', useValue: pubSub },],
})
export class AnnouncementModule {}
