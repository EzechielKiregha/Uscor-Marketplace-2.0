import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsResolver } from './settings.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Module({
  providers: [
    SettingsResolver,
    SettingsService,
    PrismaService,
    { provide: 'PUB_SUB', useValue: pubSub },
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
