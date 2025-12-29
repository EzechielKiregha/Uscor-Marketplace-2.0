import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ProductResolver } from './product.resolver'
import { ProductService } from './product.service'
import { MediaService } from '../media/media.service'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()
// Module

@Module({
  providers: [
    ProductResolver,
    ProductService,
    MediaService,
    PrismaService,
    { provide: 'PUB_SUB', useValue: pubSub },
  ],
})
export class ProductModule {}
