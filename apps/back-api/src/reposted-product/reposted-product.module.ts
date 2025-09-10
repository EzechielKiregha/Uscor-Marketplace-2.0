import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RepostedProductResolver } from './reposted-product.resolver'
import { RepostedProductService } from './reposted-product.service'

// Module
@Module({
  providers: [
    RepostedProductResolver,
    RepostedProductService,
    PrismaService,
  ],
})
export class RepostedProductModule {}
