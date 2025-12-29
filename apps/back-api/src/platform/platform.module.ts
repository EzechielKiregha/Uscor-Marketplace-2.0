import { Module } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PlatformResolver } from './platform.resolver';
import { PubSub } from 'graphql-subscriptions'
import { PrismaService } from '../prisma/prisma.service';

const pubSub = new PubSub()

@Module({
  providers: [PlatformResolver, PlatformService, PrismaService, { provide: 'PUB_SUB', useValue: pubSub },],
})
export class PlatformModule {}
