import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientResolver } from './client.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ClientResolver, ClientService, PrismaService],
})
export class ClientModule {}
