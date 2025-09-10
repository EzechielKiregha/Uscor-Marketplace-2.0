import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ProductResolver } from './product.resolver'
import { ProductService } from './product.service'
import { MediaService } from '../media/media.service'

@Module({
  providers: [
    ProductResolver,
    ProductService,
    MediaService,
    PrismaService,
  ],
})
export class ProductModule {}
