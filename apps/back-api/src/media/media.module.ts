import { Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { MediaResolver } from './media.resolver'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  providers: [MediaResolver, MediaService, PrismaService],
  imports: [
    PrismaModule,
  ],
})
export class MediaModule {}
