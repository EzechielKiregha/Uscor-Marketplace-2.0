import { Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { MediaResolver } from './media.resolver'
import { PrismaService } from 'src/prisma/prisma.service'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  providers: [MediaResolver, MediaService, PrismaService],
  imports: [
    PrismaModule,
  ],
})
export class MediaModule {}
